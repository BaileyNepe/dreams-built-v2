import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  forumAttachmentSchema,
  forumCommentSchema,
  forumLikeSchema,
  forumPostSchema,
  forumViewSchema,
  getPresignedUrlForForumSchema
} from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  generateS3Key,
  getPresignedDownloadUrl,
  getPresignedUploadUrl
} from '../../utils/s3-utils';

export const forumRouter = trpc.router({
  // Post routes
  createPost: protectedProcedure([authz.forum_create_post])
    .input(forumPostSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.forumPost.create({
        data: {
          title: input.title,
          content: input.content,
          userId: input.userId
        }
      });

      return post;
    }),

  updatePost: protectedProcedure([authz.forum_update_post])
    .input(forumPostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post ID is required for update'
        });
      }

      // Check if user is the author of the post
      const existingPost = await ctx.db.forumPost.findUnique({
        where: { id: input.id }
      });

      if (!existingPost) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        });
      }

      if (existingPost.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own posts'
        });
      }

      const post = await ctx.db.forumPost.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content
        }
      });

      return post;
    }),

  getPosts: protectedProcedure([authz.forum_view_posts])
    .input(
      z.object({
        take: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.forumPost.findMany({
        take: input.take + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true
            }
          },
          likes: true,
          views: true,
          files: true
        }
      });

      let nextCursor: typeof input.cursor | undefined;
      if (items.length > input.take) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: items.map((i) => ({
          ...i,
          files: i.files.map((f) => ({ ...f, url: getPresignedDownloadUrl(f.key) }))
        })),
        nextCursor
      };
    }),

  getPostById: protectedProcedure([authz.forum_view_posts])
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.forumPost.findUnique({
        where: { id: input },
        include: {
          user: true,
          likes: true,
          views: true,
          files: true
        }
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        });
      }

      return post;
    }),

  // Comment routes
  createComment: protectedProcedure([authz.forum_create_comment])
    .input(forumCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.forumComment.create({
        data: {
          content: input.content,
          userId: input.userId,
          postId: input.postId
        }
      });

      return comment;
    }),

  updateComment: protectedProcedure([authz.forum_update_comment])
    .input(forumCommentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Comment ID is required for update'
        });
      }

      const existingComment = await ctx.db.forumComment.findUnique({
        where: { id: input.id }
      });

      if (!existingComment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        });
      }

      if (existingComment.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own comments'
        });
      }

      const comment = await ctx.db.forumComment.update({
        where: { id: input.id },
        data: {
          content: input.content
        }
      });

      return comment;
    }),

  deleteComment: protectedProcedure([authz.forum_delete_comment])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingComment = await ctx.db.forumComment.findUnique({
        where: { id: input.id }
      });

      if (!existingComment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found'
        });
      }

      if (existingComment.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments'
        });
      }

      await ctx.db.forumComment.delete({
        where: { id: input.id }
      });

      return { success: true };
    }),

  getComments: protectedProcedure([authz.forum_view_comments])
    .input(
      z.object({
        postId: z.string(),
        take: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      // Get the total count of comments for this post
      const totalCount = await ctx.db.forumComment.count({
        where: {
          postId: input.postId,
          deleted: false
        }
      });

      const items = await ctx.db.forumComment.findMany({
        where: {
          postId: input.postId,
          deleted: false
        },
        take: input.take + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true
        }
      });

      let nextCursor: typeof input.cursor | undefined;
      if (items.length > input.take) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
        totalCount
      };
    }),

  // Like routes
  likePost: protectedProcedure([authz.forum_like_post])
    .input(forumLikeSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.postId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post ID is required'
        });
      }

      const like = await ctx.db.forumLike.create({
        data: {
          userId: input.userId,
          postId: input.postId
        }
      });

      return like;
    }),

  unlikePost: protectedProcedure([authz.forum_unlike_post])
    .input(forumLikeSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.postId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post ID is required'
        });
      }

      await ctx.db.forumLike.delete({
        where: {
          userId_postId: {
            userId: input.userId,
            postId: input.postId
          }
        }
      });

      return { success: true };
    }),

  // View routes
  markPostAsViewed: protectedProcedure([authz.forum_view_posts])
    .input(forumViewSchema)
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.forumView.create({
        data: {
          userId: input.userId,
          postId: input.postId
        }
      });

      return view;
    }),

  // File routes
  getPresignedUrl: protectedProcedure([authz.forum_create_attachment])
    .input(getPresignedUrlForForumSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if post exists
      const post = await ctx.db.forumPost.findUnique({
        where: { id: input.postId }
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        });
      }

      // Generate S3 key for the file
      const key = generateS3Key(input.postId, input.fileName);

      // Get pre-signed URL for upload
      const url = await getPresignedUploadUrl(key, input.contentType);

      return { url, key };
    }),

  createFile: protectedProcedure([authz.forum_create_attachment])
    .input(forumAttachmentSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if post exists
      const post = await ctx.db.forumPost.findUnique({
        where: { id: input.postId }
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        });
      }

      // Create the file record in the database
      const fileRecord = await ctx.db.forumFile.create({
        data: {
          name: input.name,
          key: input.key,
          url: '', // Will be populated when accessed
          size: input.size,
          contentType: input.contentType,
          post: { connect: { id: input.postId } }
        }
      });

      return fileRecord;
    }),

  listFiles: protectedProcedure([authz.forum_view_posts])
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if post exists
      const post = await ctx.db.forumPost.findUnique({
        where: { id: input.postId }
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        });
      }

      // Query for files
      const files = await ctx.db.forumFile.findMany({
        where: {
          postId: input.postId,
          deleted: false
        },
        orderBy: { uploadedAt: 'desc' }
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

  deleteFile: protectedProcedure([authz.forum_create_attachment])
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.forumFile.findUnique({
        where: { id: input }
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found'
        });
      }

      return ctx.db.forumFile.update({
        where: { id: input },
        data: { deleted: true }
      });
    })
});
