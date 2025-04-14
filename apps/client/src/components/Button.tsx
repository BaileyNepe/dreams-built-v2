import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';

export interface CustomButtonProps extends MuiButtonProps {}

const StyledButton = styled(MuiButton)`
  /* Example styling overrides */
`;

export const Button: FC<CustomButtonProps> = (props) => <StyledButton {...props} />;
