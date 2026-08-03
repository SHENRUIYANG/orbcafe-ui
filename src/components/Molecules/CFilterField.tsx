import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

interface CFilterFieldProps extends HTMLAttributes<HTMLDivElement> {
  xs?: number;
  md?: number;
  lg?: number;
  sx?: CSSProperties;
  children?: ReactNode;
}

export const CFilterField = ({ xs, md, lg, sx, children, className, ...props }: CFilterFieldProps) => {
  // Simple responsive grid item wrapper
  const gridColumn = lg ? `span ${lg}` : md ? `span ${md}` : xs ? `span ${xs}` : 'span 12';

  return (
    <div
      {...props}
      className={className}
      style={{
        gridColumn,
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </div>
  );
};
