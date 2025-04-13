import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  ContactPhone,
  Email,
  MarkEmailRead,
  MarkEmailUnread,
  ScheduleSend
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import {
  useMarkAllMessagesAsRead,
  useMarkMessageAsRead,
  useMessagesList
} from 'api/contact';
import { EnhancedTable } from 'components/EnhancedTable';
import PageLayout from 'layouts/PageLayout';
import { type FC, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate } from 'utils/date';

const MessageContent = styled(Typography)`
  background-color: ${(props) => props.theme.palette.grey[50]};
  border: 1px solid ${(props) => props.theme.palette.grey[200]};
  border-radius: 4px;
  max-height: 120px;
  overflow-y: auto;
  padding: 0.5rem;
  white-space: pre-wrap;
`;

const ContactDetails = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
`;

const UnreadIndicator = styled(Box)<{ $isRead: boolean }>`
  background-color: ${(props) =>
    props.$isRead ? 'transparent' : props.theme.palette.error.main};
  border-radius: 50%;
  height: 10px;
  margin-right: 8px;
  width: 10px;
`;

const Page: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { user } = useAuth();
  const hasAccess = user.permissions?.includes(authz.messages_read);

  const { data, isLoading, refetch } = useMessagesList({
    page,
    perPage,
    query: searchQuery || undefined
  });

  const markAsRead = useMarkMessageAsRead();
  const markAllAsRead = useMarkAllMessagesAsRead();

  const handleMarkAsRead = (id: string, isCurrentlyRead: boolean) => {
    markAsRead.mutate(
      {
        id,
        isRead: !isCurrentlyRead
      },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  if (!hasAccess) {
    return (
      <PageLayout title="Messages" description="Contact form submissions">
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You do not have permission to view this page.
          </Typography>
        </Card>
      </PageLayout>
    );
  }

  const hasUnreadMessages = data?.messages?.some((message) => !message.isRead) || false;

  const markAllAsReadButton = (
    <Tooltip title="Mark all messages as read">
      <span>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<MarkEmailRead />}
          onClick={handleMarkAllAsRead}
          disabled={!hasUnreadMessages || markAllAsRead.isPending}
        >
          Mark all as read
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <PageLayout
      title="Messages"
      description="Contact form submissions"
      actionButton={markAllAsReadButton}
    >
      <EnhancedTable
        headers={[
          { id: 'status', width: '40px', label: 'Status' },
          { id: 'sender', label: 'From' },
          { id: 'contact', label: 'Contact Details' },
          { id: 'message', label: 'Message' },
          { id: 'createdAt', label: 'Date', width: '150px' }
        ]}
        isLoading={isLoading}
        rows={
          data?.messages.map((m) => ({
            id: m.id,
            status: (
              <Tooltip title={m.isRead ? 'Mark as unread' : 'Mark as read'}>
                <IconButton size="small" onClick={() => handleMarkAsRead(m.id, m.isRead)}>
                  {m.isRead ? (
                    <MarkEmailRead fontSize="small" color="disabled" />
                  ) : (
                    <MarkEmailUnread fontSize="small" color="error" />
                  )}
                </IconButton>
              </Tooltip>
            ),
            sender: (
              <Stack direction="row" alignItems="center">
                <UnreadIndicator $isRead={m.isRead} />
                <Typography variant="subtitle2" fontWeight={m.isRead ? 'normal' : 'bold'}>
                  {m.name}
                </Typography>
              </Stack>
            ),
            contact: (
              <Stack spacing={1}>
                <ContactDetails>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={m.isRead ? 'normal' : 'bold'}>
                    {m.email}
                  </Typography>
                </ContactDetails>
                {m.phone && (
                  <ContactDetails>
                    <ContactPhone fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight={m.isRead ? 'normal' : 'bold'}>
                      {m.phone}
                    </Typography>
                  </ContactDetails>
                )}
              </Stack>
            ),
            message: (
              <MessageContent
                variant="body2"
                sx={{
                  fontWeight: m.isRead ? 'normal' : 'bold',
                  borderColor: m.isRead
                    ? undefined
                    : (theme) => theme.palette.primary.main
                }}
              >
                {m.message}
              </MessageContent>
            ),
            createdAt: (
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleSend fontSize="small" color="action" />
                <Chip
                  label={formatDate({
                    date: new Date(m.createdAt),
                    format: 'HH:mm - d/MM/yyyy'
                  })}
                  size="small"
                  variant="outlined"
                  color={m.isRead ? 'default' : 'primary'}
                />
              </Box>
            )
          })) || []
        }
        pagination={{
          page,
          perPage,
          total: data?.total || 0,
          handlePageChange: setPage,
          handlePerPageChange: setPerPage
        }}
        toolbar={{
          search: {
            placeholder: 'Search messages...',
            onChange: (e) => {
              setSearchQuery(e);
              setPage(1);
            },
            value: searchQuery
          }
        }}
      />
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/messages/')({
  component: Page
});
