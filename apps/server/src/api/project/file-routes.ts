/* eslint-disable no-console */
import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  fileMetadataSchema,
  getPresignedUrlSchema,
  updateFileSchema
} from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { z } from 'zod';
import {
  generateS3Key,
  getPresignedDownloadUrl,
  getPresignedUploadUrl
} from '../../utils/s3-utils';

// Define the optimization result interface
interface OptimizationResult {
  key: string;
  contentType: string;
  size: number;
}

// Function to run optimization in a separate process
function runOptimizationInWorker(
  key: string,
  contentType: string
): Promise<OptimizationResult> {
  return new Promise((resolve, reject) => {
    // Path to the worker script
    const workerPath = join(__dirname, '../../utils/optimize-file-worker.ts');

    // Spawn a new process for optimization
    const worker = spawn('bun', [workerPath, key, contentType], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Collect stdout
    worker.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    worker.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    worker.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the JSON result
          const result = JSON.parse(stdout) as OptimizationResult;
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse optimization result: ${error}`));
        }
      } else {
        try {
          // Try to parse the error result from stdout
          const errorResult = JSON.parse(stdout);
          if (errorResult.error) {
            reject(new Error(`Optimization failed: ${errorResult.message}`));
          } else {
            reject(new Error(`Optimization failed with code ${code}: ${stderr}`));
          }
        } catch (error) {
          // If parsing fails, use the stderr
          reject(new Error(`Optimization failed with code ${code}: ${stderr}`));
        }
      }
    });

    // Handle process errors
    worker.on('error', (error) => {
      reject(new Error(`Failed to start optimization process: ${error.message}`));
    });
  });
}

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

      // Add optimization fields if supported
      const data = {
        name: input.name || 'Unnamed File',
        key: input.key,
        url: '', // Will be populated when accessed
        size: input.size,
        contentType: input.contentType,
        project: { connect: { id: input.projectId } },

        originalKey: input.key,
        originalSize: input.size,
        originalContentType: input.contentType
      };

      // First create the file record in the database
      const fileRecord = await ctx.db.projectFile.create({ data });

      // Check if file type is supported for optimization
      const shouldOptimize =
        input.contentType.startsWith('image/') || input.contentType === 'application/pdf';

      if (shouldOptimize) {
        try {
          // Use the worker process for optimization to avoid memory issues
          runOptimizationInWorker(input.key, input.contentType)
            .then(async (optimizationResult) => {
              // Update the file record with optimized data
              await ctx.db.projectFile.update({
                where: { id: fileRecord.id },
                data: {
                  key: optimizationResult.key,
                  contentType: optimizationResult.contentType,
                  size: optimizationResult.size,
                  isOptimized: true
                }
              });
              console.log(`Successfully optimized file: ${input.name}`);
            })
            .catch((error) => {
              console.error('File optimization error:', error);
              // File record already exists with original data, so no further action needed
            });
        } catch (error) {
          console.error('Error starting optimization process:', error);
          // Continue with the original file
        }
      }

      return fileRecord;
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
          // If file is optimized, also get URL for the original version
          let originalUrl = null;
          if (file.isOptimized && file.originalKey) {
            originalUrl = await getPresignedDownloadUrl(file.originalKey);
          }

          return {
            ...file,
            url,
            originalUrl
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
