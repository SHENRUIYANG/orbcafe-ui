import { Box } from '../../../lib/orbis-compat';

interface PivotDragHandleProps {
  size?: number;
  subtle?: boolean;
}

/** Compact six-dot grip used for drag affordances in the pivot builder. */
export const PivotDragHandle = ({ size = 18, subtle = false }: PivotDragHandleProps) => {
  const dotSize = Math.max(2, Math.round(size / 6));

  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${dotSize}px)`,
        gridAutoRows: `${dotSize}px`,
        gap: `${Math.max(2, Math.round(dotSize / 1.5))}px`,
        placeItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        color: subtle ? 'var(--orb-muted)' : 'var(--orb-primary)',
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: 999,
            bgcolor: 'currentColor',
          }}
        />
      ))}
    </Box>
  );
};
