import { authz } from '@dreams-built/shared/src/auth/permissions';

import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import FileIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import PinnedIcon from '@mui/icons-material/PushPin';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Skeleton,
  Switch,
  Tooltip,
  Typography
} from '@mui/material';
import { useDeleteFile, useProjectFiles, useUpdateFile } from 'api/projectFiles';
import { ConfirmationDialog } from 'components/ConfirmationDialog';
import { EnhancedTable } from 'components/EnhancedTable';
import { formatFileSize } from 'components/FileDropzone';
import { saveAs } from 'file-saver';
import { type FC, Suspense, useState } from 'react';
import { useProjectParams } from 'routes/_dashboard/dashboard/projects/edit.$projectId';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate } from 'utils/date';
import { ProjectFileUpload } from './ProjectFileUpload';

const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) {
    return <PdfIcon />;
  } else if (contentType.includes('image')) {
    return <ImageIcon />;
  }
  return <FileIcon />;
};

const Container = styled.div`
  display: grid;
`;

const Main = styled.div`
  overflow-x: auto;
  padding: 0.2rem;
  @media (min-width: 640px) {
    padding: 1rem;
  }
`;

const FilePreviewContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  max-height: 80vh;
  min-height: 300px;
  width: 100%;

  img {
    max-height: 70vh;
    max-width: 100%;
    object-fit: contain;
  }

  iframe {
    border: none;
    height: 70vh;
    width: 100%;
  }
`;

const List: FC<{
  isArchivedVisible: boolean;
  toggleArchived: (show: boolean) => void;
}> = ({ isArchivedVisible, toggleArchived }) => {
  const { projectId } = useProjectParams();
  const { user } = useAuth();

  const files = useProjectFiles(projectId, isArchivedVisible);

  const hasEditPermission = user.permissions?.includes(authz.jobs_edit) || false;
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();

  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    fileId: '',
    action: '' as 'delete' | ''
  });

  // State for preview dialog
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    file: null as { id: string; name: string; url: string; contentType: string } | null
  });

  const handleTogglePin = (fileId: string, isPinned: boolean) => {
    if (!hasEditPermission) return;
    updateFile.mutate({ id: fileId, isPinned: !isPinned });
  };

  const handleToggleArchive = (fileId: string, isArchived: boolean) => {
    if (!hasEditPermission) return;
    updateFile.mutate({ id: fileId, isArchived: !isArchived });
  };

  const openDeleteConfirmation = (fileId: string) => {
    if (!hasEditPermission) return;
    setConfirmDialog({
      open: true,
      title: 'Delete File',
      message: 'Are you sure you want to delete this file? This action cannot be undone.',
      fileId,
      action: 'delete'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'delete' && confirmDialog.fileId) {
      deleteFile.mutate(confirmDialog.fileId);
    }

    setConfirmDialog({ open: false, title: '', message: '', fileId: '', action: '' });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, title: '', message: '', fileId: '', action: '' });
  };

  const handleRename = (fileId: string, currentName: string) => {
    if (!hasEditPermission) return;
    const newName = window.prompt('Enter new file name:', currentName);
    if (newName && newName !== currentName) {
      updateFile.mutate({ id: fileId, name: newName });
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        saveAs(blob, fileName);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Download error:', error);
        // Optionally fallback: open the URL
        window.open(url, '_blank');
      });
  };

  const handleRowClick = (url: string) => {
    const file = files.find((f) => f.url === url);
    if (file) {
      setPreviewDialog({
        open: true,
        file: {
          id: file.id,
          name: file.name,
          url: file.url,
          contentType: file.contentType
        }
      });
    }
  };

  const renderFilePreview = (file: { contentType: string; url: string }) => {
    if (file.contentType.includes('image')) {
      return <img src={file.url} alt="File preview" />;
    } else if (file.contentType.includes('pdf')) {
      return <iframe src={`${file.url}#toolbar=0`} title="PDF preview" />;
    }
    return (
      <Box sx={{ textAlign: 'center' }}>
        <FileIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography>This file type cannot be previewed</Typography>
      </Box>
    );
  };

  const closePreviewDialog = () => {
    setPreviewDialog({
      open: false,
      file: null
    });
  };

  return !files?.length ? (
    <Typography variant="body1" color="textSecondary" align="center">
      No files have been uploaded for this project yet.
    </Typography>
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Typography variant="h6">Project Files ({files.length})</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isArchivedVisible}
              onChange={(e) => {
                toggleArchived(e.target.checked);
              }}
              color="primary"
            />
          }
          label="Show archived files"
        />
      </Box>

      <Container>
        <Main>
          <EnhancedTable
            onRowClick={(id) => {
              const file = files.find((f) => f.id === id);
              if (file) {
                handleRowClick(file.url);
              }
            }}
            headers={[
              { id: 'icon', label: '' },
              { id: 'name', label: 'File Name', width: '100%' },
              { id: 'size', label: 'Size' },
              { id: 'uploadedAt', label: 'Upload Date' },
              { id: 'actions', label: '' }
            ]}
            rows={files.map((file) => ({
              id: file.id,
              icon: getFileIcon(file.contentType),
              name: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {file.isPinned && (
                    <Tooltip title="Pinned">
                      <PinnedIcon fontSize="small" color="primary" />
                    </Tooltip>
                  )}
                  {file.name}
                  {file.isArchived && (
                    <Chip size="small" label="Archived" variant="outlined" />
                  )}
                </Box>
              ),
              size: formatFileSize(file.size),
              uploadedAt: formatDate({ date: file.uploadedAt, format: 'dd/MM/yyyy' }),
              actions: [
                {
                  icon: <DownloadIcon color="primary" />,
                  label: 'Download',
                  onClick: () => {
                    handleDownload(file.url, file.name);
                  }
                },
                ...(hasEditPermission
                  ? [
                      {
                        icon: file.isPinned ? (
                          <PinnedIcon />
                        ) : (
                          <PinnedIcon color="disabled" />
                        ),
                        label: file.isPinned ? 'Unpin' : 'Pin',
                        onClick: () => {
                          handleTogglePin(file.id, file.isPinned);
                        }
                      },
                      {
                        icon: <EditIcon />,
                        label: 'Rename',
                        onClick: () => {
                          handleRename(file.id, file.name);
                        }
                      },
                      {
                        icon: file.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />,
                        label: file.isArchived ? 'Unarchive' : 'Archive',
                        color: 'warning' as const,
                        onClick: () => {
                          handleToggleArchive(file.id, file.isArchived);
                        }
                      },
                      {
                        color: 'error' as const,
                        icon: <DeleteIcon />,
                        label: 'Delete',
                        onClick: () => {
                          openDeleteConfirmation(file.id);
                        }
                      }
                    ]
                  : [])
              ]
            }))}
          />

          {/* Preview Dialog */}
          <Dialog
            open={previewDialog.open}
            onClose={closePreviewDialog}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>{previewDialog.file?.name || 'File Preview'}</DialogTitle>
            <DialogContent dividers>
              <FilePreviewContent>
                {previewDialog.file && renderFilePreview(previewDialog.file)}
              </FilePreviewContent>
            </DialogContent>
            <DialogActions>
              <Button onClick={closePreviewDialog}>Close</Button>
              {previewDialog.file && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    previewDialog.file &&
                    handleDownload(previewDialog.file.url, previewDialog.file.name)
                  }
                >
                  Download
                </Button>
              )}
            </DialogActions>
          </Dialog>

          <ConfirmationDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={handleConfirmAction}
            onCancel={handleCloseDialog}
            confirmText={confirmDialog.action === 'delete' ? 'Delete' : 'Confirm'}
            severity={confirmDialog.action === 'delete' ? 'error' : 'warning'}
          />
        </Main>
      </Container>
    </>
  );
};

export const ProjectFileList: FC = () => {
  const { projectId } = useProjectParams();
  const [showArchived, setShowArchived] = useState(false);

  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Files
          </Typography>
          <ProjectFileUpload projectId={projectId} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
          <List isArchivedVisible={showArchived} toggleArchived={setShowArchived} />
        </Suspense>
      </CardContent>
    </Card>
  );
};
