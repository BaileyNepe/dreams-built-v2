import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  fileMetadataSchema,
  getPresignedUrlSchema,
  updateFileSchema
} from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { optimizeFile } from '../../utils/file-optimizer';
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

      // Check for schema support for optimization fields
      // by creating a temporary queryth original details
      const hasOptimizationFields = await ctx.db.$queryRaw`a try-catch to handle potential schema issues
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS ctFile.create({
        WHERE TABLE_NAME = 'ProjectFile' AND COLUMN_NAME = 'originalKey'
      `.then(result => (result as any)[0].count > 0)
        .catch(() => false);

      // Create base data object? {
      const baseData = {input.key,
        name: input.name || 'Unnamed File',
        key: input.key,
        url: '', // Will be populated when accessed   } : {}),
        size: input.size,   url: '', // Will be populated when accessed
        contentType: input.contentType,            size: input.size,
        project: { connect: { id: input.projectId } }
      };ct: { id: input.projectId } }

      // Add optimization fields if supported        });
      const data = hasOptimizationFields 
        ? {eck if file type is supported for optimization
            ...baseData,
            originalKey: input.key, input.contentType === 'application/pdf') &&
            originalSize: input.size,= 'true';
            originalContentType: input.contentType,
          }
        : baseData;
tion happens asynchronously - we don't wait for it
      // First create the file record in the databaseentType)
      const fileRecord = await ctx.db.projectFile.create({ data });
ptimized data
      // Check if file type is supported for optimizationtFile.update({
      const shouldOptimize = where: { id: fileRecord.id },
        hasOptimizationFields && data: {
        (input.contentType.startsWith('image/') || input.contentType === 'application/pdf');
      contentType: optimizationResult.contentType,
      if (shouldOptimize) {izationResult.size,
        try {
          // Optimization happens asynchronously - we don't wait for it
          optimizeFile(input.key, input.contentType) });
            .then(async (optimizationResult) => {og(`Successfully optimized file: ${input.name}`);
              // Update the file record with optimized data
              await ctx.db.projectFile.update({
                where: { id: fileRecord.id },       console.error('File optimization error:', error);
                data: {         // File record already exists with original data, so no further action needed
                  key: optimizationResult.key,              });
                  contentType: optimizationResult.contentType,) {
                  size: optimizationResult.size,     console.error('Error starting optimization process:', error);
                  isOptimized: true            // Continue with the original file
                }
              });
              console.log(`Successfully optimized file: ${input.name}`);
            })ileRecord;
            .catch((error) => {
              console.error('File optimization error:', error);optimization if schema isn't updated
              // File record already exists with original data, so no further action neededconsole.error('Error creating file with optimization fields:', error);
            });   
        } catch (error) {b.projectFile.create({
          console.error('Error starting optimization process:', error);
          // Continue with the original file
        }
      }   url: '', // Will be populated when accessed
            size: input.size,
      return fileRecord;pe: input.contentType,
    }),t: { id: input.projectId } }

  // List files for a project
  list: protectedProcedure([authz.jobs_read])
    .input( return fileRecord;
      z.object({      }
        projectId: z.string(),
        includeArchived: z.boolean().default(false)
      })for a project
    )s_read])
    .query(async ({ ctx, input }) => {
      // Check if project exists
      const project = await ctx.db.project.findUnique({ojectId: z.string(),
        where: { id: input.projectId, deleted: false }
      });
    )
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',project.findUnique({
          message: 'Project not found'
        });      });
      }

      // Query for files
      const files = await ctx.db.projectFile.findMany({
        where: {essage: 'Project not found'
          projectId: input.projectId,        });
          deleted: false,
          isArchived: input.includeArchived ? undefined : false
        },or files
        orderBy: [{ isPinned: 'desc' }, { uploadedAt: 'desc' }]it ctx.db.projectFile.findMany({
      });e: {
projectId: input.projectId,
      // Generate presigned URLs for each file  deleted: false,
      const filesWithUrls = await Promise.all(          isArchived: input.includeArchived ? undefined : false
        files.map(async (file) => {
          const url = await getPresignedDownloadUrl(file.key); orderBy: [{ isPinned: 'desc' }, { uploadedAt: 'desc' }]
      });
          // If file is optimized, also get URL for the original version
          let originalUrl = null;
          if (file.isOptimized && file.originalKey) {await Promise.all(
            originalUrl = await getPresignedDownloadUrl(file.originalKey);
          }.key);

          return { also get URL for the original version
            ...file, let originalUrl = null;
            url,          if (file.isOptimized && file.originalKey) {
            originalUrlalUrl = await getPresignedDownloadUrl(file.originalKey);
          };
        })
      );
 ...file,
      return filesWithUrls;     url,
    }),            originalUrl

  // Update file metadata (name, pinned status, archived status)
  update: protectedProcedure([authz.jobs_edit])
    .input(updateFileSchema)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectFile.findUnique({
        where: { id: input.id, deleted: false },
        include: { project: true }te file metadata (name, pinned status, archived status)
      }); protectedProcedure([authz.jobs_edit])
put(updateFileSchema)
      if (!file) {    .mutation(async ({ ctx, input }) => {
        throw new TRPCError({ await ctx.db.projectFile.findUnique({
          code: 'NOT_FOUND',,
          message: 'File not found'ject: true }
        });
      }

      // Update the file recordhrow new TRPCError({
      return ctx.db.projectFile.update({          code: 'NOT_FOUND',
        where: { id: input.id }, 'File not found'
        data: {
          name: input.name !== undefined ? input.name : file.name,
          isPinned: input.isPinned !== undefined ? input.isPinned : file.isPinned,
          isArchived: input.isArchived !== undefined ? input.isArchived : file.isArchiveddate the file record
        }eturn ctx.db.projectFile.update({
      });        where: { id: input.id },
    }),
= undefined ? input.name : file.name,
  // Delete a filened !== undefined ? input.isPinned : file.isPinned,
  delete: protectedProcedure([authz.jobs_edit]) isArchived: input.isArchived !== undefined ? input.isArchived : file.isArchived
    .input(z.string())  }
    .mutation(async ({ ctx, input }) => {   });
      const file = await ctx.db.projectFile.findUnique({    }),

















});    })      });        data: { deleted: true }        where: { id: input },      return ctx.db.projectFile.update({      }        });          message: 'File not found'          code: 'NOT_FOUND',        throw new TRPCError({      if (!file) {      });        where: { id: input, deleted: false }
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
