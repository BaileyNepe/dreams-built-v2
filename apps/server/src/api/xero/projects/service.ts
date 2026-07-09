import { prisma } from '@config/db';
import { TRPCError } from '@trpc/server';
import { type XeroClient } from 'xero-node';
import { invalidateXeroCache } from 'libs/xero/cache';
import { withXero } from 'libs/xero/tokens';

export const buildXeroProjectName = (project: {
  jobNumber: number;
  address: string;
  city: string;
}) =>
  `${project.jobNumber} - ${project.address}${project.city ? `, ${project.city}` : ''}`;

// Xero `where` clauses wrap values in double quotes; strip them from the name.
const escapeForWhere = (value: string) => value.replace(/"/g, '');

export const findOrCreateContactForClient = async (
  xero: XeroClient,
  tenantId: string,
  client: { id: string; name: string; xeroContactId: string | null }
): Promise<string> => {
  if (client.xeroContactId) {
    return client.xeroContactId;
  }

  if (!client.name.trim()) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The client has no name, so a Xero contact cannot be created for it'
    });
  }

  const search = await xero.accountingApi.getContacts(
    tenantId,
    undefined,
    `Name="${escapeForWhere(client.name)}"`,
    undefined,
    undefined,
    undefined,
    undefined,
    true
  );

  let contactId = search.body.contacts?.[0]?.contactID;

  if (!contactId) {
    const created = await xero.accountingApi.createContacts(tenantId, {
      contacts: [{ name: client.name }]
    });
    contactId = created.body.contacts?.[0]?.contactID;
  }

  if (!contactId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Xero did not return a contact for the client'
    });
  }

  await prisma.client.update({
    where: { id: client.id },
    data: { xeroContactId: contactId }
  });

  return contactId;
};

export const pushProjectToXero = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true }
  });

  if (!project || project.deleted) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
  }

  const name = buildXeroProjectName(project);

  const xeroProjectId = await withXero(async (xero, tenantId) => {
    const contactId = await findOrCreateContactForClient(xero, tenantId, project.client);

    if (project.xeroProjectId) {
      await xero.projectApi.updateProject(tenantId, project.xeroProjectId, {
        name,
        contactId
      });

      return project.xeroProjectId;
    }

    const created = await xero.projectApi.createProject(tenantId, { name, contactId });
    const createdId = created.body.projectId;

    if (!createdId) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Xero did not return a project id'
      });
    }

    return createdId;
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { xeroProjectId, xeroSyncedAt: new Date() }
  });

  invalidateXeroCache('projects');

  return { xeroProjectId };
};
