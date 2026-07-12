import { Box } from '@mui/material';
import styled from 'styled-components';

export const TaskBar = styled(Box)<{
  $backgroundColor?: string;
  $color?: string;
  $printGridColumnStart?: number;
  $printGridColumnEnd?: number;
}>`
  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor || theme.palette.grey[300]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ $color, theme }) => $color || theme.palette.grey[600]};
  font-size: 0.7rem;
  font-weight: bold;
  overflow: visible;
  padding: 0.25rem 0.5rem;
  /* Anchor for the resize grips; keep vertical touch scrolling alive. */
  position: relative;
  touch-action: pan-y;
  white-space: normal;

  @media print {
    grid-column-start: ${({ $printGridColumnStart }) => $printGridColumnStart};
    grid-column-end: ${({ $printGridColumnEnd }) => $printGridColumnEnd};
  }
`;
