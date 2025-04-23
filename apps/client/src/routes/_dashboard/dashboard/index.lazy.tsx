/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import {
  type ForumPost,
  useComments,
  useCreateAttachment,
  useCreateComment,
  useCreatePost,
  useGetPresignedUrl,
  usePosts
} from 'api/forum';
import { useScheduleQuery } from 'api/schedule';
import { useTimesheetEntries } from 'api/timesheet';
import { FileDropzone, type FileWithPreview } from 'components/FileDropzone';
import Image from 'components/Image';
import InfiniteScroll from 'components/InfiniteScroll';
import { type FC, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate, getDate, getEndOfWeek, getWeekStart } from 'utils/date';

// Styled components for the dashboard
const DashboardContainer = styled(Box)`
  margin: 0 auto;
  max-width: 1200px;
  padding: ${(props) => props.theme.spacing?.(3) || '24px'};
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 2rem 0 1rem;
`;

const WelcomeCard = styled(Card)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.light};
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-bottom: 2rem;
`;

const ScheduleItem = styled(Paper)`
  && {
    align-items: center;
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    display: flex;
    justify-content: space-between;
    margin-bottom: ${(props) => props.theme.spacing?.(1) || '8px'};
    padding: ${(props) => props.theme.spacing?.(2) || '16px'};
  }
`;

const NoticeBox = styled(Paper)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    padding: ${(props) => props.theme.spacing?.(2) || '16px'};
    width: 100%;
  }
`;

const NoticeAlert = styled(Alert)`
  width: 100%;
`;

const Board = styled.div`
  display: grid;
  gap: 2rem;
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BlockGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Items = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const AdminContactMessage = styled(Card)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.light};
    margin-top: 2rem;
    padding: ${(props) => props.theme.spacing?.(4) || '32px'};
    text-align: center;
  }
`;

const ForumPostCard = styled(Card)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    margin-bottom: 1rem;
  }
`;

const ForumPostHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ForumPostContent = styled.div`
  margin-bottom: 1rem;
`;

const ForumPostFooter = styled.div`
  align-items: center;
  color: ${(props) => props.theme.palette.text.secondary};
  display: flex;
  font-size: 0.875rem;
  justify-content: space-between;
`;

const CreatePostButton = styled(Button)`
  margin-bottom: 1rem;
`;

const CommentSection = styled.div`
  border-top: 1px solid ${(props) => props.theme.palette.divider};
  margin-top: 1rem;
  padding-top: 1rem;
`;

const CommentItem = styled(Paper)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    margin-bottom: 0.5rem;
    padding: 0.75rem;
  }
`;

const CommentHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentContent = styled.div`
  margin-bottom: 0.5rem;
`;

const CommentInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const Route = createLazyFileRoute('/_dashboard/dashboard/')({
  component: Dashboard
});

function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <WelcomeCard>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4">Welcome, {user.firstName || 'User'}</Typography>
              <Typography variant="body1" color="textSecondary">
                {formatDate({ format: 'ccc d LLL' })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </WelcomeCard>

      {user.role === 'USER' ? <UserContactAdmin /> : <DashboardContent />}
    </DashboardContainer>
  );
}

function UserContactAdmin() {
  return (
    <AdminContactMessage>
      <Typography variant="h5" gutterBottom>
        Limited Access
      </Typography>
      <Typography variant="body1" paragraph>
        Please contact the administrator to request full access to the dashboard.
      </Typography>
      <Typography variant="body1" fontWeight="bold">
        Email: admin@dreamsbuilt.co.nz
      </Typography>
    </AdminContactMessage>
  );
}

// Forum Post Component
const ForumPostComponent: FC<{ post: ForumPost }> = ({ post }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const createComment = useCreateComment();
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(
    null
  );

  // Only fetch comments when the post is expanded
  const { comments, totalCount, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useComments(post.id);

  const handleCommentChange = (value: string) => {
    setNewComment(value);
  };

  const handleCreateComment = () => {
    if (!newComment.trim()) return;

    createComment.mutate(
      {
        content: newComment,
        userId: user.id,
        postId: post.id
      },
      {
        onSuccess: () => {
          setNewComment('');
          // Expand the post when a comment is added
          setIsExpanded(true);
        }
      }
    );
  };

  // Helper function to determine if a file is an image
  const isImageFile = (contentType: string) => contentType.startsWith('image/');

  const handleImageClick = (file: { url: string; name: string }) => {
    setPreviewImage(file);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // Handle clicking on the post to expand/collapse
  const handlePostClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ForumPostCard onClick={handlePostClick} sx={{ cursor: 'pointer' }}>
      <CardContent>
        <ForumPostHeader>
          <Typography variant="h6">{post.title}</Typography>
          <Typography variant="caption">
            {formatDate({
              date: new Date(post.createdAt),
              format: 'd MMM yyyy'
            })}
          </Typography>
        </ForumPostHeader>
        <ForumPostContent>
          <Typography variant="body2">{post.content}</Typography>

          {/* Display attachments if any */}
          {post.files && post.files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments ({post.files.length})
              </Typography>

              {/* Image previews */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {post.files
                  .filter((file) => isImageFile(file.contentType))
                  .map((file) => (
                    <Box
                      key={file.id}
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent post expansion when clicking image
                        handleImageClick(file);
                      }}
                    >
                      <Image
                        src={file.url}
                        alt={file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          p: 0.5,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {file.name}
                      </Box>
                    </Box>
                  ))}
              </Box>

              {/* File list for non-image files */}
              {post.files.some((file) => !isImageFile(file.contentType)) && (
                <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  {post.files
                    .filter((file) => !isImageFile(file.contentType))
                    .map((file) => (
                      <ListItem key={file.id} divider>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            variant="outlined"
                            href={file.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // Prevent post expansion when clicking download
                          >
                            Download
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                </List>
              )}
            </Box>
          )}
        </ForumPostContent>
        <ForumPostFooter>
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src={post.user?.image || '/default-avatar.png'}
              alt={`${post.user?.firstName} ${post.user?.lastName}`}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                mr: 1,
                objectFit: 'cover',
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
            <Typography variant="caption">
              Posted by {post.user?.firstName} {post.user?.lastName}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="caption" sx={{ mr: 1 }}>
              {totalCount} {totalCount === 1 ? 'comment' : 'comments'}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent double triggering
                setIsExpanded(!isExpanded);
              }}
              aria-label={isExpanded ? 'Hide comments' : 'Show comments'}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </ForumPostFooter>

        {isExpanded && (
          <CommentSection onClick={(e) => e.stopPropagation()}>
            {' '}
            {/* Prevent post collapse when interacting with comments */}
            <Typography variant="subtitle2" gutterBottom>
              Comments ({totalCount})
            </Typography>
            {comments.length > 0 ? (
              <InfiniteScroll
                hasMore={hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={fetchNextPage}
              >
                {comments.map((comment) => (
                  <CommentItem key={comment.id}>
                    <CommentHeader>
                      <Box display="flex" alignItems="center">
                        <Box
                          component="img"
                          src={comment.user?.image || '/default-avatar.png'}
                          alt={`${comment.user?.firstName} ${comment.user?.lastName}`}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            mr: 1,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <Typography variant="subtitle2">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Typography>
                      </Box>
                      <Typography variant="caption">
                        {formatDate({
                          date: new Date(comment.createdAt),
                          format: 'd MMM yyyy HH:mm'
                        })}
                      </Typography>
                    </CommentHeader>
                    <CommentContent>
                      <Typography variant="body2">{comment.content}</Typography>
                    </CommentContent>
                  </CommentItem>
                ))}
              </InfiniteScroll>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
            <CommentInput>
              <TextField
                size="small"
                placeholder="Write a comment..."
                fullWidth
                variant="outlined"
                value={newComment}
                onChange={(e) => handleCommentChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateComment();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleCreateComment}
                disabled={!newComment.trim() || createComment.isPending}
              >
                <SendIcon />
              </IconButton>
            </CommentInput>
          </CommentSection>
        )}
      </CardContent>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onClose={handleClosePreview} maxWidth="lg" fullWidth>
        <DialogTitle>{previewImage?.name}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh'
            }}
          >
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          {previewImage && (
            <Button
              href={previewImage.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ForumPostCard>
  );
};

function DashboardContent() {
  const { user } = useAuth();

  const { posts, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const createPost = useCreatePost();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const getPresignedUrl = useGetPresignedUrl();
  const createAttachment = useCreateAttachment();
  const dropzoneRef = useRef<{ clearFiles: () => void }>(null);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      // Create the post first
      const postResult = await createPost.mutateAsync({
        title: newPostTitle,
        content: newPostContent,
        userId: user.id
      });

      // If there are files to upload, handle them
      if (files.length > 0) {
        setIsUploading(true);

        // Upload each file
        for (const file of files) {
          try {
            // Get presigned URL for upload
            const presignedUrlResult = await getPresignedUrl.mutateAsync({
              fileName: file.name,
              contentType: file.type,
              postId: postResult.id
            });

            // Upload the file to S3
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: progress
                }));
              }
            });

            // Create a promise to handle the upload
            const uploadPromise = new Promise<void>((resolve, reject) => {
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

            // Create the file record in the database
            await createAttachment.mutateAsync({
              name: file.name,
              key: presignedUrlResult.key,
              size: file.size,
              contentType: file.type,
              postId: postResult.id
            });
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
          }
        }

        setIsUploading(false);
        setUploadProgress({});
      }

      // Reset form and close dialog
      setOpenCreateDialog(false);
      setNewPostTitle('');
      setNewPostContent('');
      setFiles([]);
      if (dropzoneRef.current) {
        dropzoneRef.current.clearFiles();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleFilesAdded = (newFiles: FileWithPreview[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const userEntries = useTimesheetEntries({
    weekStart: getWeekStart(getEndOfWeek({ weeks: -1 }).toFormat('yyyy-MM-dd')),
    userId: user.id
  });

  const upcomingSchedule = useScheduleQuery(
    formatDate(),
    formatDate({ date: getEndOfWeek({ weeks: 1 }) })
  );

  const hasNotEnteredTimesheet =
    (!userEntries.data?.entries.length || !userEntries.data?.notes.length) &&
    !userEntries.isLoading &&
    user.role === 'EMPLOYEE';

  return (
    <>
      <Board>
        {/* Notices section */}
        <BlockGrid>
          <SectionTitle variant="h5">Notices</SectionTitle>

          {hasNotEnteredTimesheet && (
            <NoticeAlert
              severity="warning"
              sx={{
                border: (theme) => `1px solid ${theme.palette.warning.main}`
              }}
            >
              <Typography variant="body2" color="warning.main" fontStyle="italic">
                You have not entered any timesheets for the last week.
              </Typography>
            </NoticeAlert>
          )}

          <NoticeBox>
            <Typography variant="subtitle1" fontWeight="bold">
              Closed Days
            </Typography>
            {upcomingSchedule?.blockedDays.map((day, index) => (
              <Box key={index} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>
                    {formatDate({ date: getDate(day.date), format: 'ccc d LLL' })}
                  </strong>
                  : {day.details || 'Closed'}
                </Typography>
              </Box>
            ))}
          </NoticeBox>
        </BlockGrid>

        {/* Upcoming schedule section */}
        <BlockGrid>
          <SectionTitle variant="h5">Upcoming Schedule</SectionTitle>

          <Items>
            {(upcomingSchedule?.schedule.length ?? 0) > 0 ? (
              upcomingSchedule?.schedule
                .flatMap((scheduleItem) =>
                  scheduleItem.projectSchedule.map((item) => ({
                    scheduleId: scheduleItem.id,
                    id: item.id,
                    startDate: new Date(item.startDate),
                    endDate: new Date(item.endDate),
                    project: item.project,
                    notes: item.notes
                  }))
                )
                .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                .map((item) => (
                  <ScheduleItem key={`${item.scheduleId}-${item.id}`} elevation={1}>
                    <Box>
                      <Typography variant="subtitle1">
                        {item.project.jobNumber}: {item.project.address}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.startDate.toLocaleDateString()} -{' '}
                        {item.endDate.toLocaleDateString()}
                      </Typography>
                      {item.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {item.notes}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: item.project.color
                      }}
                    />
                  </ScheduleItem>
                ))
            ) : (
              <Typography variant="body1">No upcoming scheduled projects.</Typography>
            )}
          </Items>
        </BlockGrid>
      </Board>

      <SectionHeader>
        <SectionTitle variant="h5">Recent Forum Posts</SectionTitle>
        <CreatePostButton
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDialog(true)}
        >
          Create New Post
        </CreatePostButton>
      </SectionHeader>
      {posts.length > 0 ? (
        <InfiniteScroll
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        >
          {posts.map((post) => (
            <ForumPostComponent key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      ) : (
        <NoticeBox>
          <NoticeAlert severity="info">No forum posts yet.</NoticeAlert>
        </NoticeBox>
      )}

      {/* Create Post Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Forum Post</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="content"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Attachments
          </Typography>

          <FileDropzone
            ref={dropzoneRef}
            onFilesAdded={handleFilesAdded}
            isUploading={isUploading}
            multiple={true}
            maxFiles={5}
            maxSize={10485760} // 10MB
            accept={{
              'image/*': [],
              'application/pdf': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                [],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
            }}
          />

          {files.length > 0 && (
            <List sx={{ mt: 2, bgcolor: 'background.paper' }}>
              {files.map((file) => (
                <ListItem key={file.name} divider>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    {uploadProgress[file.name] !== undefined ? (
                      <Typography variant="caption">
                        {uploadProgress[file.name]}%
                      </Typography>
                    ) : (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFile(file.name)}
                        disabled={isUploading}
                      >
                        <AttachFileIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            color="primary"
            disabled={
              createPost.isPending ||
              isUploading ||
              !newPostTitle.trim() ||
              !newPostContent.trim()
            }
          >
            {createPost.isPending || isUploading ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
