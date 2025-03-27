import { Box } from '@mui/material';
import styled from 'styled-components';

export const TaskBar = styled(Box)<{
  $top: string;
  $left: string;
  $width: string;
  $backgroundColor?: string;
  $color?: string;
}>`
  // if there is not background color then add a dashed border
  border: ${({ $backgroundColor, theme }) =>
    !$backgroundColor ? `1px dashed ${theme.palette.grey[500]}` : 'none'};

  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor || theme.palette.grey[300]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ $color, theme }) => $color || theme.palette.grey[600]};
  font-size: 0.7rem;
  font-weight: bold;
  left: ${({ $left }) => $left};
  min-height: 20px;
  overflow: hidden;
  padding: 0.25rem 0.5rem;
  position: absolute;
  text-overflow: ellipsis;
  top: ${({ $top }) => $top};
  white-space: nowrap;
  width: ${({ $width }) => $width};
`;
