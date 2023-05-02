import { Variant } from '@/types';
import React from 'react';
import { Alert } from 'react-bootstrap';

const Message = ({ variant = 'info', children, margin = '2rem' }: { variant: Variant; children: React.ReactNode; margin?: string }) => {
  return (
    <Alert style={{ margin: margin }} variant={variant}>
      {children}
    </Alert>
  );
};

export default Message;
