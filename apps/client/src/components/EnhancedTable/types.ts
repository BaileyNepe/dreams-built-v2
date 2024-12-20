import { type ButtonProps } from '@mui/material';

export type Action = {
  label: string;
  onClick: () => void;
  enabled?: boolean;
  color?: ButtonProps['color'];
  icon?: React.JSX.Element;
  description?: string;
};

export type Order = 'asc' | 'desc';

export type Align = 'left' | 'right' | 'center';
export type HeadCell = {
  disablePadding?: boolean;
  id: string;
  label?: string;
  align?: Align;
  width?: string;
  sortable?: boolean;
};

export type EnhancedData = {
  id: string;
  actions?: Action[];
  [key: string]:
    | string
    | number
    | Action[]
    | string[]
    | number[]
    | boolean
    | Date
    | undefined
    | React.ReactNode;
};
