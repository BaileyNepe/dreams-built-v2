import { Box, LinearProgress, Typography } from '@mui/material';
import { useCreateFileRecord, useGetPresignedUrl } from 'api/projectFiles';
import {
  FileDropzone,
  type FileDropzoneHandle,
  type FileWithPreview
} from 'components/FileDropzone';
import { notify } from 'libs/Notify';
import { type FC, useRef, useState } from 'react';

interface UploadProgressItem {
  id: string;
  fileName: string;
  progress: number;
}

export const ProjectFileUpload: FC<{
  projectId: string;
}> = ({ projectId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);
  const dropzoneRef = useRef<FileDropzoneHandle>(null);
  const getPresignedUrl = useGetPresignedUrl();
  const createFileRecord = useCreateFileRecord();

  const uploadFile = async (file: FileWithPreview): Promise<void> => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadProgress((prev) => [
      ...prev,
      { id: fileId, fileName: file.name, progress: 0 }
    ]);

    try {
      const presignedUrlResult = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        projectId
      });

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Create a promise to handle the upload
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) =>
              prev.map((item) => (item.id === fileId ? { ...item, progress } : item))
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
      });

      // Open and send the request
      xhr.open('PUT', presignedUrlResult.url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      // Wait for the upload to complete
      await uploadPromise;

      await createFileRecord.mutateAsync({
        name: file.name,
        contentType: file.type,
        size: file.size,
        key: presignedUrlResult.key,
        projectId
      });

      // Update progress to complete
      setUploadProgress((prev) =>
        prev.map((item) => (item.id === fileId ? { ...item, progress: 100 } : item))
      );

      return Promise.resolve();
    } catch (error) {
      notify(`Error uploading ${file.name}`, { type: 'error' });
      // Remove the failed upload from progress tracking
      setUploadProgress((prev) => prev.filter((item) => item.id !== fileId));
      return Promise.reject(error);
    }
  };

  const handleFilesAdded = async (newFiles: FileWithPreview[]) => {
    if (!newFiles.length) return;

    try {
      setIsUploading(true);
      // Upload all files in parallel
      await Promise.all(newFiles.map((file) => uploadFile(file)));

      notify(
        `${newFiles.length} file${newFiles.length > 1 ? 's' : ''} uploaded successfully`,
        { type: 'success' }
      );

      // Clear files after all uploads complete
      if (dropzoneRef.current) {
        dropzoneRef.current.clearFiles();
      }

      // Clear progress after a delay to show completion
      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);
    } catch (error) {
      // Individual file errors are handled in uploadFile function
      // eslint-disable-next-line no-console
      console.error('Some files failed to upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <FileDropzone
        ref={dropzoneRef}
        onFilesAdded={handleFilesAdded}
        isUploading={isUploading}
        multiple={true} // Enable multiple file uploads
        maxFiles={10}
        maxSize={1073741824} // 1gb
        accept={{
          'image/*': [],
          'application/pdf': [],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
          'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
          'text/plain': [],
          'application/zip': [],
          'video/*': [] // Add support for video files
        }}
      />

      {uploadProgress.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {uploadProgress.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mb: 1.5
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5
                }}
              >
                <Typography variant="body2" noWrap sx={{ maxWidth: '75%' }}>
                  {item.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};
