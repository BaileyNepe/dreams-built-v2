import { notify } from 'libs/Notify';
import { api } from './trpc';

// Hook to get a presigned URL for direct file upload
export const useGetPresignedUrl = () =>
  api.projectFiles.getPresignedUrl.useMutation({
    onError: (error) => {
      notify(`Error getting upload URL: ${error.message}`, { type: 'error' });
    }
  });

// Hook to create a file record after upload
export const useCreateFileRecord = () => {
  const utils = api.useUtils();

  return api.projectFiles.create.useMutation({
    onSuccess: () => {
      notify('File uploaded successfully', { type: 'success' });
      // Invalidate the file list queries to refresh the list
      utils.projectFiles.list.invalidate();
    },
    onError: (error) => {
      notify(`Error creating file record: ${error.message}`, { type: 'error' });
    }
  });
};

// Hook to list files for a project
export const useProjectFiles = (projectId: string, includeArchived = false) =>
  api.projectFiles.list.useSuspenseQuery(
    {
      projectId,
      includeArchived
    },
    {
      refetchInterval: 1000 * 30,
      refetchOnWindowFocus: true
    }
  )[0];

// Hook to update file metadata
export const useUpdateFile = () => {
  const utils = api.useUtils();

  return api.projectFiles.update.useMutation({
    onSuccess: () => {
      notify('File updated successfully', { type: 'success' });
      utils.projectFiles.list.invalidate();
    },
    onError: (error) => {
      notify(`Error updating file: ${error.message}`, { type: 'error' });
    }
  });
};

// Hook to delete a file
export const useDeleteFile = () => {
  const utils = api.useUtils();

  return api.projectFiles.delete.useMutation({
    onSuccess: () => {
      notify('File deleted successfully', { type: 'success' });
      utils.projectFiles.list.invalidate();
    },
    onError: (error) => {
      notify(`Error deleting file: ${error.message}`, { type: 'error' });
    }
  });
};
