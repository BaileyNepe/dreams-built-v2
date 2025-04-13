import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, CircularProgress, Typography } from '@mui/material';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const DropzoneContainer = styled.div<{ isDragActive: boolean }>`
  background-color: ${({ theme, isDragActive }) =>
    isDragActive ? theme.palette.action.hover : 'transparent'};
  border: 2px dashed
    ${({ theme, isDragActive }) =>
      isDragActive ? theme.palette.primary.main : theme.palette.divider};
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  padding: 20px;
  text-align: center;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export interface FileWithPreview extends File {
  preview?: string;
}

export interface FileDropzoneHandle {
  clearFiles: () => void;
}

export const FileDropzone = forwardRef<
  FileDropzoneHandle,
  {
    onFilesAdded: (files: FileWithPreview[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    accept?: Record<string, string[]>;
    isUploading?: boolean;
  }
>(
  (
    {
      onFilesAdded,
      multiple = true,
      maxFiles = 10,
      maxSize = 10485760, // 10MB
      accept = {
        'image/*': [],
        'application/pdf': [],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
      },
      isUploading = false
    },
    ref
  ) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        );

        // Update files state first
        setFiles((prevFiles) => {
          const combined = [...prevFiles, ...newFiles];
          // If not multiple, only keep the latest file
          const result = multiple ? combined : newFiles;

          // Immediately trigger the upload process
          onFilesAdded(result);

          return result;
        });
      },
      [multiple, onFilesAdded]
    );

    // Add a method to clear all files
    const clearFiles = () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
    };

    // Expose the clearFiles method through the ref
    useImperativeHandle(ref, () => ({
      clearFiles
    }));

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple,
      maxFiles,
      maxSize,
      accept
    });

    return (
      <Box sx={{ width: '100%' }}>
        <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            {isDragActive
              ? 'Drop the files here'
              : isUploading
                ? 'Uploading...'
                : `Drag and drop ${multiple ? 'files' : 'a file'} here, or click to select ${multiple ? 'files' : 'a file'}`}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {isUploading
              ? 'Your files are being uploaded automatically'
              : `Accepted file types: Images, PDF, Word, Excel (Max ${formatFileSize(maxSize)})`}
          </Typography>
        </DropzoneContainer>

        {isUploading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Uploading files...
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
);
