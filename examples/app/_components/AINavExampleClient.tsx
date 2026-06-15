'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CAINavProvider, CAppPageLayout, CPageTransition, useAINav } from 'orbcafe-ui';
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

function AINavStatusCard() {
  const { isRecording, isHotkeyRecording, isSubmitting, startRecording, stopRecording } = useAINav();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Chip size="small" color={isRecording ? 'success' : 'default'} label={`isRecording: ${String(isRecording)}`} />
        <Chip
          size="small"
          color={isHotkeyRecording ? 'primary' : 'default'}
          label={`isHotkeyRecording: ${String(isHotkeyRecording)}`}
        />
        <Chip size="small" color={isSubmitting ? 'warning' : 'default'} label={`isSubmitting: ${String(isSubmitting)}`} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            void startRecording();
          }}
        >
          Manual Start
        </Button>
        <Button size="small" variant="outlined" onClick={stopRecording}>
          Manual Stop
        </Button>
      </Stack>
    </Paper>
  );
}

export default function AINavExampleClient() {
  const [partialText, setPartialText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [lastEvent, setLastEvent] = useState('');

  const menuData = EXAMPLE_MENU;

  return (
    <CAINavProvider
      longPressMs={200}
      onVoicePartial={(text) => {
        setPartialText(text);
        setLastEvent(`Partial @ ${new Date().toLocaleTimeString()}`);
      }}
      onVoiceSubmit={async (text) => {
        setSubmittedText(text);
        setErrorText('');
        setLastEvent(`Submit @ ${new Date().toLocaleTimeString()}`);
      }}
      onVoiceError={(error) => {
        setErrorText(error);
        setLastEvent(`Error @ ${new Date().toLocaleTimeString()}`);
      }}
    >
      <CAppPageLayout
        appTitle=""
        menuData={menuData}
        locale="en"
        localeLabel="EN"
        user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
        logo={<HeaderBrandLogo />}
      >
        <CPageTransition transitionKey="ai-nav-demo" variant="fade" durationMs={200}>
          <Box sx={{ p: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Alert severity="info">
              Hold <strong>Space</strong> for at least 200ms to trigger voice-nav overlay. Release Space to stop.
            </Alert>

            <AINavStatusCard />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Tip: click blank area first, then long-press Space. When focus is inside input, hotkey is ignored by default.
                </Typography>
                <TextField size="small" label="Focus test input" placeholder="When cursor is here, Space hotkey is ignored" />
                <Typography variant="body2">
                  <strong>Partial:</strong> {partialText || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Submitted:</strong> {submittedText || '-'}
                </Typography>
                <Typography variant="body2" color={errorText ? 'error.main' : 'text.primary'}>
                  <strong>Error:</strong> {errorText || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lastEvent || 'No events yet'}
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </CPageTransition>
      </CAppPageLayout>
    </CAINavProvider>
  );
}
