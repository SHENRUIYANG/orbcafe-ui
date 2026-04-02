import React from 'react';
import { Box, Collapse, IconButton, Paper, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

interface PivotSectionCardProps {
  title: string;
  subtitle: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  expandAriaLabel: string;
  collapseAriaLabel: string;
  children: React.ReactNode;
  bodySx?: SxProps<Theme>;
  unmountOnExit?: boolean;
  headerActions?: React.ReactNode;
}

const bodyPaddingX = { xs: 1.2, md: 1.6 };

export const PivotSectionCard: React.FC<PivotSectionCardProps> = ({
  title,
  subtitle,
  collapsed,
  onToggleCollapse,
  expandAriaLabel,
  collapseAriaLabel,
  children,
  bodySx,
  unmountOnExit = false,
  headerActions,
}) => {
  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        bgcolor: alpha(theme.palette.background.paper, 0.95),
      })}
    >
      <Box
        sx={(theme) => ({
          px: bodyPaddingX,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderBottom: !collapsed ? `1px solid ${theme.palette.divider}` : 'none',
        })}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 800 }}>{title}</Typography>
          <Typography
            sx={{
              fontSize: '0.74rem',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {headerActions}
          <IconButton
            size="small"
            aria-label={collapsed ? expandAriaLabel : collapseAriaLabel}
            onClick={onToggleCollapse}
            sx={(theme) => ({
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.88),
              width: 28,
              height: 28,
              borderRadius: 999,
              flexShrink: 0,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.08),
              },
            })}
          >
            <KeyboardArrowUpIcon
              sx={{
                fontSize: 16,
                transition: 'transform 220ms cubic-bezier(0.2, 0, 0, 1)',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!collapsed} timeout={260} easing="cubic-bezier(0.2, 0, 0, 1)" unmountOnExit={unmountOnExit}>
        <Box sx={[{ px: bodyPaddingX, py: { xs: 1.2, md: 1.6 } }, ...(Array.isArray(bodySx) ? bodySx : bodySx ? [bodySx] : [])]}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};
