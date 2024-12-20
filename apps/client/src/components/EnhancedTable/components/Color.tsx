import { type FC } from 'react';
import styled from 'styled-components';

const ColorIcon = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
`;

export const Color: FC<{ color: string }> = ({ color }) => <ColorIcon color={color} />;
