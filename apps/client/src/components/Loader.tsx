import CircularProgress from '@mui/material/CircularProgress';
import { type FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const Loader: FC<{
  type?: 'determinate' | 'indeterminate';
  value?: number;
  size?: number | string;
}> = ({ value, type, size }) => (
  <Container>
    <CircularProgress size={size} variant={type} value={value} />
  </Container>
);

export default Loader;
