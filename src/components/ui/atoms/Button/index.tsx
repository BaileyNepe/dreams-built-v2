import { type Variant } from '@/types';
import { Button as ButtonBase } from 'react-bootstrap';

const Button = ({
  text,
  variant,
  type,
  onClick,
}: {
  variant: Variant;
  text: string | JSX.Element;
  type: 'button' | 'submit';
  onClick?: () => void;
  width?: string;
}) => (
  <ButtonBase variant={variant} type={type} onClick={onClick}>
    {text}
  </ButtonBase>
);

export default Button;
