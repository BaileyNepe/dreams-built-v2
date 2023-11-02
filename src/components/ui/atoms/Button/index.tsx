import { type Variant } from '@/types';
import { Button as ButtonBase } from 'react-bootstrap';

const Button = ({
  text,
  type = 'button',
  variant = 'primary',
  className,
  children,
  onClick,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  text?: string | JSX.Element;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  width?: string;
  children?: React.ReactNode;
}) => (
  <ButtonBase variant={variant} type={type} onClick={onClick} className={className} {...rest}>
    {text || children}
  </ButtonBase>
);

export default Button;
