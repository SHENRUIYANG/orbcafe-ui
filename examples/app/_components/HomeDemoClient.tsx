'use client';

import Link from 'next/link';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Rocket, Table2, TabletSmartphone, Workflow } from 'lucide-react';
import { CAppPageLayout, CPageTransition } from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

const HeaderBrandLogo = () => {
  const theme = useTheme();
  const src = theme.palette.mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

  return (
    <Box
      component="img"
      src={src}
      alt="ORBCAFE UI"
      sx={{ width: 280, maxWidth: '32vw', height: 52, display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

const overviewCards = [
  {
    title: 'Reports',
    description: 'Standard report, pivot table, and detail info live here.',
    href: '/std-report',
    icon: <Table2 className="h-5 w-5" />,
    accent: '#2563eb',
  },
  {
    title: 'Operations',
    description: 'Planning Gantt, Kanban board, and pad workflows.',
    href: '/planning',
    icon: <Workflow className="h-5 w-5" />,
    accent: '#0f766e',
  },
  {
    title: 'AI Tools',
    description: 'Chat, copilot, agent panel, and voice navigation.',
    href: '/chat',
    icon: <Rocket className="h-5 w-5" />,
    accent: '#7c3aed',
  },
  {
    title: 'Touch Demo',
    description: 'Pad-first layout for scanners, keys, and fast entry.',
    href: '/pad',
    icon: <TabletSmartphone className="h-5 w-5" />,
    accent: '#d97706',
  },
] as const;

export default function HomeDemoClient() {
  return (
    <CAppPageLayout
      appTitle=""
      menuData={EXAMPLE_MENU}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey="dashboard-home" variant="fade" durationMs={180}>
        <Box sx={{ p: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: { xs: 2, md: 2.5 },
              borderRadius: 4,
              borderColor: 'divider',
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.84))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.92))',
            })}
          >
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Chip label="Examples workspace" color="primary" variant="outlined" size="small" />
                <Chip label="Navigation island unified" variant="outlined" size="small" />
              </Stack>

              <Typography sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 900, lineHeight: 1.05 }}>
                ORBCAFE dashboard
              </Typography>
              <Typography sx={{ maxWidth: 780, color: 'text.secondary' }}>
                This landing page now carries the full example navigation again. Login takes you here first, and the menu
                branches from dashboard, reports, operations, to the AI workbench instead of dumping straight into standard report.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button component={Link} href="/std-report" variant="contained">
                  Open standard report
                </Button>
                <Button component={Link} href="/login" variant="outlined">
                  Open login page
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            {overviewCards.map((card) => (
              <Link key={card.title} href={card.href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <Paper
                  variant="outlined"
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 4,
                    borderColor: 'divider',
                    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: card.accent,
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 18px 34px rgba(0,0,0,0.35)'
                          : '0 18px 34px rgba(15,23,42,0.08)',
                    },
                  })}
                >
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.accent,
                        bgcolor: `${card.accent}18`,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>{card.title}</Typography>
                      <Typography sx={{ mt: 0.35, color: 'text.secondary' }}>{card.description}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Link>
            ))}
          </Box>
        </Box>
      </CPageTransition>
    </CAppPageLayout>
  );
}
