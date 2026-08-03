import { getOrbCompatMode } from '../../../lib/orbis-compat';
import { Collapse, KeyboardArrowUpIcon, SxProps, Theme } from '../../../lib/orbis-compat';
import React from 'react';
import {  CIconButton, CPaper, CTypography } from "../../Atoms";
import { orbAlpha } from "../../../lib/theme";

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
    <CPaper
      sx={(theme) => ({
        borderRadius: 'var(--orb-r-container)',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        bgcolor: orbAlpha(theme.palette.background.paper, 0.95),
      })}
    >
      <div
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
        <div sx={{ minWidth: 0, flex: 1 }}>
          <CTypography sx={{ fontSize: '0.9rem', fontWeight: 800 }}>{title}</CTypography>
          <CTypography
            sx={{
              fontSize: '0.74rem',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </CTypography>
        </div>

        <div sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          {headerActions}
          <CIconButton
            size="small"
            aria-label={collapsed ? expandAriaLabel : collapseAriaLabel}
            onClick={onToggleCollapse}
            sx={(theme) => ({
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: orbAlpha(theme.palette.background.paper, 0.88),
              width: 28,
              height: 28,
              borderRadius: 999,
              flexShrink: 0,
              '&:hover': {
                bgcolor: getOrbCompatMode() === 'dark' ? orbAlpha(theme.palette.primary.main, 0.18) : orbAlpha(theme.palette.primary.main, 0.08),
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
          </CIconButton>
        </div>
      </div>

      <Collapse in={!collapsed} timeout={260} easing="cubic-bezier(0.2, 0, 0, 1)" unmountOnExit={unmountOnExit}>
        <div sx={[{ px: bodyPaddingX, py: { xs: 1.2, md: 1.6 } }, ...(Array.isArray(bodySx) ? bodySx : bodySx ? [bodySx] : [])]}>
          {children}
        </div>
      </Collapse>
    </CPaper>
  );
};
