'use client';

import React, { useMemo, useState } from 'react';
import { CAINavProvider, CAppPageLayout, CPageTransition, CPaper, CStack, CButton, CTypography, CTextField, CAlert, useOrbMode, useAINav } from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

const HeaderBrandLogo = () => {
  const mode = useOrbMode();
  const src = mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

  return (
    <img
      src={src}
      alt="ORBCAFE UI"
      style={{ width: 280, maxWidth: '32vw', height: 52, display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

function AINavStatusCard() {
  const { isRecording, isHotkeyRecording, isSubmitting, startRecording, stopRecording } = useAINav();

  return (
    <CPaper sx={{ padding: 16 }}>
      <CStack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', padding: '4px 12px', borderRadius: 16, backgroundColor: isRecording ? 'var(--orb-success-bg)' : 'var(--orb-surface)', color: isRecording ? 'var(--orb-success)' : 'inherit' }}>
          isRecording: {String(isRecording)}
        </span>
        <span style={{ fontSize: '0.875rem', padding: '4px 12px', borderRadius: 16, backgroundColor: isHotkeyRecording ? 'var(--orb-primary-bg)' : 'var(--orb-surface)', color: isHotkeyRecording ? 'var(--orb-primary)' : 'inherit' }}>
          isHotkeyRecording: {String(isHotkeyRecording)}
        </span>
        <span style={{ fontSize: '0.875rem', padding: '4px 12px', borderRadius: 16, backgroundColor: isSubmitting ? 'var(--orb-warn-bg)' : 'var(--orb-surface)', color: isSubmitting ? 'var(--orb-warn)' : 'inherit' }}>
          isSubmitting: {String(isSubmitting)}
        </span>
      </CStack>

      <CStack direction="row" spacing={1} sx={{ marginTop: 12 }}>
        <CButton
          size="small"
          variant="outlined"
          onClick={() => {
            void startRecording();
          }}
        >
          Manual Start
        </CButton>
        <CButton size="small" variant="outlined" onClick={stopRecording}>
          Manual Stop
        </CButton>
      </CStack>
    </CPaper>
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
        navigationVariant="v2"
        searchPlacement="header"
        menuData={menuData}
        locale="en"
        localeLabel="EN"
        user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
        onUserRefresh={() => window.location.reload()}
        onUserLogout={() => window.location.assign('/login')}
        logo={<HeaderBrandLogo />}
      >
        <CPageTransition transitionKey="ai-nav-demo" variant="fade" durationMs={200}>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CAlert severity="info">
              Hold <strong>Space</strong> for at least 200ms to trigger voice-nav overlay. Release Space to stop.
            </CAlert>

            <AINavStatusCard />

            <CPaper sx={{ padding: 16 }}>
              <CStack spacing={1}>
                <CTypography sx={{ fontSize: '0.875rem', color: 'var(--orb-muted)' }}>
                  Tip: click blank area first, then long-press Space. When focus is inside input, hotkey is ignored by default.
                </CTypography>
                <CTextField dense label="Focus test input" placeholder="When cursor is here, Space hotkey is ignored" />
                <CTypography sx={{ fontSize: '0.875rem' }}>
                  <strong>Partial:</strong> {partialText || '-'}
                </CTypography>
                <CTypography sx={{ fontSize: '0.875rem' }}>
                  <strong>Submitted:</strong> {submittedText || '-'}
                </CTypography>
                <CTypography sx={{ fontSize: '0.875rem', color: errorText ? 'var(--orb-err)' : 'inherit' }}>
                  <strong>Error:</strong> {errorText || '-'}
                </CTypography>
                <CTypography sx={{ fontSize: '0.75rem', color: 'var(--orb-muted)' }}>
                  {lastEvent || 'No events yet'}
                </CTypography>
              </CStack>
            </CPaper>
          </div>
        </CPageTransition>
      </CAppPageLayout>
    </CAINavProvider>
  );
}
