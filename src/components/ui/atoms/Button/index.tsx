import { type Variant } from '@/types';
import { Button as ButtonBase } from 'react-bootstrap';

const Button = ({
  text,
  variant,
  type,
}: {
  variant: Variant;
  text: string;
  type: 'button' | 'submit';
}) => (
  <ButtonBase variant={variant} type={type}>
    {text}
  </ButtonBase>
);

export default Button;
