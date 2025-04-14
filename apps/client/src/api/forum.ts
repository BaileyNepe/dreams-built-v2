import { notify } from 'libs/Notify';
import { api } from './trpc';

// Post hooks
export const useCreatePost = () => {
  const utils = api.useUtils();

  return api.forum.createPost.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Post created successfully');
    }
  });
};

export const useUpdatePost = () => {
  const utils = api.useUtils();

  return api.forum.updatePost.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Post updated successfully');
    }
  });
};

export const usePosts = (pageSize = 10) => {
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.forum.getPosts.useInfiniteQuery(
    { take: pageSize },
    {
      getNextPageParam: (lastPage: {
        items: unknown[];
        nextCursor: string | null | undefined;
      }) => {
        if (lastPage.items.length < pageSize) return undefined;
        return lastPage.nextCursor;
      }
    }
  );
  const posts = postsData?.pages.flatMap((page) => page.items) || [];

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};

export type ForumPost = Awaited<ReturnType<typeof usePosts>>['posts'][number];

export const usePost = (id: string) => api.forum.getPostById.useQuery(id);

// Comment hooks
export const useCreateComment = () => {
  const utils = api.useUtils();

  return api.forum.createComment.useMutation({
    onSuccess: ({ postId }) => {
      utils.forum.getComments.invalidate({ postId });
      notify('Comment created successfully');
    }
  });
};

export const useUpdateComment = () => {
  const utils = api.useUtils();

  return api.forum.updateComment.useMutation({
    onSuccess: ({ postId }) => {
      utils.forum.getComments.invalidate({ postId });
      notify('Comment updated successfully');
    }
  });
};

export const useComments = (postId: string, pageSize = 10) => {
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.forum.getComments.useInfiniteQuery(
    { postId, take: pageSize },
    {
      getNextPageParam: (lastPage: {
        items: unknown[];
        nextCursor: string | null | undefined;
        totalCount: number;
      }) => {
        if (lastPage.items.length < pageSize) return undefined;
        return lastPage.nextCursor;
      }
    }
  );

  const comments = commentsData?.pages.flatMap((page) => page.items) || [];
  const totalCount = commentsData?.pages[0]?.totalCount || 0;

  return {
    comments,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};

// Like hooks
export const useLikePost = () => {
  const utils = api.useUtils();

  return api.forum.likePost.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Post liked successfully');
    }
  });
};

export const useUnlikePost = () => {
  const utils = api.useUtils();

  return api.forum.unlikePost.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Post unliked successfully');
    }
  });
};

// View hooks
export const useMarkPostAsViewed = () => {
  const utils = api.useUtils();

  return api.forum.markPostAsViewed.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Post marked as viewed');
    }
  });
};

// Attachment hooks
export const useCreateAttachment = () => {
  const utils = api.useUtils();

  return api.forum.createFile.useMutation({
    onSuccess: () => {
      utils.forum.getPosts.invalidate();
      notify('Attachment created successfully');
    }
  });
};

export const useGetPresignedUrl = () => api.forum.getPresignedUrl.useMutation();
