import { type Variant } from '@/types';
import { Button as ButtonBase } from 'react-bootstrap';

const Button = ({
  text,
  type = 'button',
  variant = 'primary',
  children,
  onClick,
}: {
  variant?: Variant;
  text?: string | JSX.Element;
  type?: 'button' | 'submit';
  onClick?: () => void;
  width?: string;
  children?: React.ReactNode;
}) => (
  <ButtonBase variant={variant} type={type} onClick={onClick}>
    {text || children}
  </ButtonBase>
);

export default Button;
