import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  fileMetadataSchema,
  getPresignedUrlSchema,
  updateFileSchema
} from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  generateS3Key,
  getPresignedDownloadUrl,
  getPresignedUploadUrl
} from '../../utils/s3-utils';

export const projectFilesRouter = trpc.router({
  // Get a pre-signed URL for uploading a file directly to S3
  getPresignedUrl: protectedProcedure([authz.upload])
    .input(getPresignedUrlSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if project exists
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId, deleted: false }
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }

      // Generate S3 key for the file
      const key = generateS3Key(input.projectId, input.fileName);

      // Get pre-signed URL for upload
      const url = await getPresignedUploadUrl(key, input.contentType);

      return { url, key };
    }),

  // Create file record after upload is complete
  create: protectedProcedure([authz.upload])
    .input(fileMetadataSchema.extend({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if project exists
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId, deleted: false }
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }

      // Create the file record in the database
      return ctx.db.projectFile.create({
        data: {
          name: input.name || 'Unnamed File',
          key: input.key,
          url: '', // Will be populated when accessed
          size: input.size,
          contentType: input.contentType,
          project: { connect: { id: input.projectId } }
        }
      });
    }),

  // List files for a project
  list: protectedProcedure([authz.jobs_read])
    .input(
      z.object({
        projectId: z.string(),
        includeArchived: z.boolean().default(false)
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if project exists
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId, deleted: false }
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }

      // Query for files
      const files = await ctx.db.projectFile.findMany({
        where: {
          projectId: input.projectId,
          deleted: false,
          isArchived: input.includeArchived ? undefined : false
        },
        orderBy: [{ isPinned: 'desc' }, { uploadedAt: 'desc' }]
      });

      // Generate presigned URLs for each file
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const url = await getPresignedDownloadUrl(file.key);
          return {
            ...file,
            url
          };
        })
      );

      return filesWithUrls;
    }),

  // Update file metadata (name, pinned status, archived status)
  update: protectedProcedure([authz.jobs_edit])
    .input(updateFileSchema)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectFile.findUnique({
        where: { id: input.id, deleted: false },
        include: { project: true }
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found'
        });
      }

      // Update the file record
      return ctx.db.projectFile.update({
        where: { id: input.id },
        data: {
          name: input.name !== undefined ? input.name : file.name,
          isPinned: input.isPinned !== undefined ? input.isPinned : file.isPinned,
          isArchived: input.isArchived !== undefined ? input.isArchived : file.isArchived
        }
      });
    }),

  // Delete a file
  delete: protectedProcedure([authz.jobs_edit])
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectFile.findUnique({
        where: { id: input, deleted: false }
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found'
        });
      }

      return ctx.db.projectFile.update({
        where: { id: input },
        data: { deleted: true }
      });
    })
});
