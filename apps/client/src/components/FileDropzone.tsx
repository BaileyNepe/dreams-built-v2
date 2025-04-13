import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
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

const FileItem = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
  display: flex;
  margin: 8px 0;
  padding: 8px;
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

export const FileDropzone = ({
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
}: {
  onFilesAdded: (files: FileWithPreview[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  isUploading?: boolean;
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );

      setFiles((prevFiles) => {
        const combined = [...prevFiles, ...newFiles];
        // If not multiple, only keep the latest file
        const result = multiple ? combined : newFiles;
        onFilesAdded(result);
        return result;
      });
    },
    [multiple, onFilesAdded]
  );

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      onFilesAdded(newFiles);
      return newFiles;
    });
  };

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
            : 'Drag and drop files here, or click to select files'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Accepted file types: Images, PDF, Word, Excel (Max {formatFileSize(maxSize)})
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

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected files ({files.length})
          </Typography>

          {files.map((file, index) => (
            <FileItem key={`${file.name}-${index}`}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                disabled={isUploading}
              >
                Remove
              </Button>
            </FileItem>
          ))}
        </Box>
      )}
    </Box>
  );
};
