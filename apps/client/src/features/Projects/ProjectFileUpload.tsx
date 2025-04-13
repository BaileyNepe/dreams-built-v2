import { useCreateFileRecord, useGetPresignedUrl } from 'api/projectFiles';
import { FileDropzone } from 'components/FileDropzone';
import { notify } from 'libs/Notify';
import { type FC, useState } from 'react';

export const ProjectFileUpload: FC<{
  projectId: string;
}> = ({ projectId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const getPresignedUrl = useGetPresignedUrl();
  const createFileRecord = useCreateFileRecord();

  const handleFilesAdded = async (files: File[]) => {
    try {
      const [file] = files;
      const presignedUrlResult = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        projectId
      });

      const response = await fetch(presignedUrlResult.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      await createFileRecord.mutateAsync({
        name: file.name,
        contentType: file.type,
        size: file.size,
        key: presignedUrlResult.key,
        projectId
      });

      notify('File uploaded successfully', { type: 'success' });
    } catch (error) {
      notify('Error uploading file', { type: 'error' });
    }
  };

  return (
    <FileDropzone
      onFilesAdded={handleFilesAdded}
      isUploading={isUploading}
      multiple={true}
      maxFiles={10}
      maxSize={1073741824} // 1gb
      accept={{
        'image/*': [],
        'application/pdf': [],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
        'text/plain': [],
        'application/zip': []
      }}
    />
  );
};
