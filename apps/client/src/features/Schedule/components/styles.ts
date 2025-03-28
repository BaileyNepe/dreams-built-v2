import { Box } from '@mui/material';
import styled from 'styled-components';

export const TaskBar = styled(Box)<{
  $left: string;
  $width: string;
  $backgroundColor?: string;
  $color?: string;
  $dynamicHeight?: boolean;
}>`
  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor || theme.palette.grey[300]};
  border: ${({ $backgroundColor, theme }) =>
    !$backgroundColor ? `1px dashed ${theme.palette.grey[500]}` : 'none'};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ $color, theme }) => $color || theme.palette.grey[600]};
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: ${({ $left }) => $left};
  overflow: ${({ $dynamicHeight }) =>
    $dynamicHeight ? 'visible' : 'hidden'}; /* remove absolute vertical positioning */
  padding: 0.25rem 0.5rem;
  position: relative;
  white-space: ${({ $dynamicHeight }) => ($dynamicHeight ? 'normal' : 'nowrap')};
  width: ${({ $width }) => $width};
`;
