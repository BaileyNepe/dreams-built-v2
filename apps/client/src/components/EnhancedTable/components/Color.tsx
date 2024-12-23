import { type FC } from 'react';
import styled from 'styled-components';
import { getContrastingColor } from 'utils/color';

/* STYLES */

const CircleWrapper = styled.div<{ color: string }>`
  align-items: center;
  display: flex;
`;

const CircleIcon = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
`;

const CircleText = styled.span`
  margin-left: 0.5rem;
`;

const BackgroundBox = styled.div<{ color: string; textColor: string }>`
  background-color: ${({ color }) => color};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ textColor }) => textColor};
  font-weight: 600;
  padding: 0.5rem 1rem;
  text-align: center;
  text-transform: capitalize;
`;

/* COMPONENT */

export const Color: FC<{
  color: string;
  type?: 'circle' | 'background';
  text?: string;
}> = ({ color, type = 'circle', text }) => {
  if (type === 'circle' && !text) {
    return <CircleIcon color={color} />;
  }

  if (type === 'circle' && text) {
    return (
      <CircleWrapper color={color}>
        <CircleIcon color={color} />
        <CircleText>{text}</CircleText>
      </CircleWrapper>
    );
  }

  const textColor = getContrastingColor(color);
  return (
    <BackgroundBox color={color} textColor={textColor}>
      {text || ''}
    </BackgroundBox>
  );
};
