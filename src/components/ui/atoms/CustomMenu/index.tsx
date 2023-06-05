import { Children, forwardRef } from 'react';

const CustomMenu = forwardRef(
  (
    {
      children,
      style,
      className,
      'aria-labelledby': labeledBy,
    }: {
      'children': React.ReactNode;
      'style'?: React.CSSProperties;
      'className'?: string;
      'aria-labelledby'?: string;
    },
    ref: React.ForwardedRef<HTMLDivElement> | undefined,
  ) => (
    <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
      <ul className='list-unstyled'>{Children.toArray(children)}</ul>
    </div>
  ),
);

export default CustomMenu;
