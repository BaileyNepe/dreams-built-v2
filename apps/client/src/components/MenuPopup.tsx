import { ClickAwayListener } from '@mui/base/ClickAwayListener';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import Menu from '@mui/material/Menu';
import { useState, type FC, type MouseEvent } from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { type Action } from './EnhancedTable/types';

/* Types */

export type IconVariant = 'outlined' | 'text';

/* Styles */

const StyledMenu = styled(Menu)`
  & .MuiPaper-root {
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    box-shadow: ${({ theme }) => theme.customShadows.outline};
    color: ${({ theme }) =>
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300]};
    min-width: 100px;

    & .MuiMenuItem-root {
      & .MuiSvgIcon-root {
        color: ${({ theme }) => theme.palette.text.secondary};
        font-size: 18px;
        margin-right: ${({ theme }) => theme.spacing(1.5)}px;
      }
      &:active {
        background-color: ${({ theme }) => theme.palette.action.selectedOpacity};
      }
    }
  }
`;

const ListItem = styled.li`
  display: flex;
  width: 100%;
  button {
    justify-content: flex-start;
    margin: 0.1rem 0.2rem;
    width: 100%;
  }
`;

const StyledIconButton = styled(IconButton)<{
  $isActive: boolean;
  $variant: 'outlined' | 'text';
}>`
  && {
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;

    transition: all 0.3s ease-in-out;

    ${({ $variant, theme }) =>
      $variant === 'outlined' &&
      `
    && {
      border: 1px solid ${theme.palette.grey[400]};
      margin: 0.2rem;
      padding: 0.1rem;
    }
  `}

    ${({ $isActive, theme }) =>
      $isActive &&
      `
    && {
    border-color: ${theme.palette.primary.main};
    color: ${theme.palette.primary.main};
    }
  `}
  }
`;

/* Component */

export const MenuPopup: FC<{
  actions?: Action[];
  verticalIcon?: boolean;
  iconVariant?: IconVariant;
}> = ({ actions, verticalIcon = false, iconVariant = 'text' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <StyledIconButton
        $isActive={open}
        onClick={handleClick}
        disableRipple
        $variant={iconVariant}
      >
        {verticalIcon ? <MoreVertIcon /> : <MoreHorizIcon />}
      </StyledIconButton>

      <StyledMenu
        onClick={(e) => {
          e.stopPropagation();
        }}
        elevation={0}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        id="customized-menu"
        MenuListProps={{
          'aria-labelledby': 'customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <>
            {actions?.map(({ onClick, icon, label, color, enabled = true }, index) => (
              <ListItem
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Button
                  key={index}
                  variant="text"
                  disabled={!enabled}
                  size="small"
                  color={color}
                  startIcon={icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    onClick();
                  }}
                >
                  {label}
                </Button>
              </ListItem>
            ))}
          </>
        </ClickAwayListener>
      </StyledMenu>
    </>
  );
};
