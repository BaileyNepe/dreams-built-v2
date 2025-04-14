import { Typography } from '@mui/material';
import styled from 'styled-components';

export const StyledHeading = styled(Typography)`
  && {
    color: ${({ theme }) => theme.palette.common.white};
    text-align: center;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
    text-transform: uppercase;
  }
`;

export const StyledCaption = styled(Typography)`
  && {
    color: ${({ theme }) => theme.palette.common.white};
    display: block;
    margin: 0.2rem auto 0.5rem;
    max-width: 30rem;
    text-align: center;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  }
`;
