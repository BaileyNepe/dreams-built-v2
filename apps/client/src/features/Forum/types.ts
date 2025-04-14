import {
  type forumAttachmentSchema,
  type forumCommentSchema,
  type forumPostSchema
} from '@dreams-built/shared/src/schemas';
import { type z } from 'zod';

// Use the schemas from shared to define our types
export type Post = z.infer<typeof forumPostSchema>;
export type Comment = z.infer<typeof forumCommentSchema>;
export type Attachment = z.infer<typeof forumAttachmentSchema>;

export interface PostFormData {
  title: string;
  content: string;
  attachments?: File[];
}

export interface CommentFormData {
  content: string;
  attachments?: File[];
}

export interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onLikePost: (postId: string, isLiked: boolean) => void;
  onDeletePost: (postId: string) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
  onLike: (postId: string, isLiked: boolean) => void;
  onDelete: (postId: string) => void;
}

export interface PostDetailDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (postId: string) => void;
  onLike: (postId: string, isLiked: boolean) => void;
  isEditMode: boolean;
  onCancelEdit: () => void;
  onSubmitEdit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface PostFormProps {
  initialData?: PostFormData;
  onSubmit: (data: PostFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface ForumPage {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
