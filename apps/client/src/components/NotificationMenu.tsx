import { MailOutline, MarkEmailRead, NotificationsOutlined } from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import {
  useMarkMessageAsRead,
  useMessagesList,
  useUnreadMessagesCount
} from 'api/contact';
import { type FC, useState } from 'react';
import styled from 'styled-components';
import { formatDate } from 'utils/date';
import { paths } from 'utils/paths';

const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    background-color: ${({ theme }) => theme.palette.error.main};
    color: white;
    font-weight: bold;
    right: -3px;
    top: 3px;
  }
`;

const NotificationTitle = styled(Typography)`
  align-items: center;
  display: flex;
  font-weight: bold;
  justify-content: space-between;
  padding: 12px 16px;
`;

const EmptyNotifications = styled(Box)`
  color: ${({ theme }) => theme.palette.text.secondary};
  padding: 20px;
  text-align: center;
`;

const NotificationItem = styled(MenuItem)`
  align-items: flex-start;
  border-left: 3px solid transparent;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  min-height: 60px;
  padding: 12px 16px;
  white-space: normal;
  width: 350px;

  &.unread {
    background-color: ${({ theme }) =>
      theme.palette.mode === 'dark'
        ? theme.palette.action.hover
        : theme.palette.grey[50]};
    border-left: 3px solid ${({ theme }) => theme.palette.primary.main};
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const NotificationHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  width: 100%;
`;

const NotificationContent = styled(Typography)`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const NotificationDate = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  flex-shrink: 0;
  margin-left: 8px;
`;

const ViewAllButton = styled(Button)`
  margin: 8px 16px;
  text-transform: none;
`;

const MarkAsReadIcon = styled(IconButton)`
  font-size: 0.8rem;
  padding: 4px;
`;

export const NotificationMenu: FC<{
  maxNotifications?: number;
}> = ({ maxNotifications = 5 }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const { data: unreadMessagesData } = useUnreadMessagesCount({
    refetchInterval: 30000 // Check every 30 seconds
  });
  const unreadMessages = unreadMessagesData?.count || 0;

  const { data } = useMessagesList({
    page: 1,
    perPage: maxNotifications,
    query: undefined
  });

  const markAsRead = useMarkMessageAsRead();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMessageClick = (_id: string) => {
    navigate({ to: paths.messages });
    handleCloseMenu();
  };

  const handleViewAll = () => {
    navigate({ to: paths.messages });
    handleCloseMenu();
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead.mutate({ id });
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpenMenu}
          size="small"
          color="inherit"
          aria-label={`${unreadMessages} unread notifications`}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <StyledBadge
            badgeContent={unreadMessages}
            color="error"
            invisible={unreadMessages === 0}
          >
            <NotificationsOutlined />
          </StyledBadge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
      >
        <NotificationTitle variant="subtitle2">
          Notifications
          {unreadMessages > 0 && <Badge badgeContent={unreadMessages} color="error" />}
        </NotificationTitle>

        <Divider />

        {!data?.messages || data.messages.length === 0 ? (
          <EmptyNotifications>
            <Typography variant="body2">No notifications</Typography>
          </EmptyNotifications>
        ) : (
          <>
            {data.messages.map((message) => (
              <NotificationItem
                key={message.id}
                onClick={() => handleMessageClick(message.id)}
                className={message.isRead ? '' : 'unread'}
              >
                <NotificationHeader>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MailOutline
                      fontSize="small"
                      color={message.isRead ? 'disabled' : 'primary'}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight={message.isRead ? 'normal' : 'bold'}
                    >
                      {message.name}
                    </Typography>
                  </Box>

                  {!message.isRead && (
                    <MarkAsReadIcon
                      size="small"
                      onClick={(e) => handleMarkAsRead(e, message.id)}
                      title="Mark as read"
                    >
                      <MarkEmailRead fontSize="small" color="action" />
                    </MarkAsReadIcon>
                  )}
                </NotificationHeader>

                <NotificationContent variant="body2">
                  {message.message}
                </NotificationContent>

                <Box display="flex" justifyContent="space-between" width="100%" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {message.email}
                  </Typography>
                  <NotificationDate variant="caption">
                    {formatDate({
                      date: new Date(message.createdAt),
                      format: 'HH:mm - d/MM/yyyy'
                    })}
                  </NotificationDate>
                </Box>
              </NotificationItem>
            ))}

            <Divider />

            <ViewAllButton fullWidth variant="text" onClick={handleViewAll}>
              View all notifications
            </ViewAllButton>
          </>
        )}
      </Menu>
    </>
  );
};
