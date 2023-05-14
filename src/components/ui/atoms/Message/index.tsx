import { type Variant } from '@/types';
import type React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({
  variant = 'info',
  children,
  margin = '2rem',
}: {
  variant: Variant;
  children: React.ReactNode;
  margin?: string;
}) => (
  <Alert style={{ margin }} variant={variant}>
    {children}
  </Alert>
);

export default Message;
