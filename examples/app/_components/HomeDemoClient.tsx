'use client';

import Link from 'next/link';
import { Rocket, Table2, TabletSmartphone, Workflow } from 'orbcafe-ui';
import { ExamplePageLayout } from './ExamplePageLayout';
import {
  CPageTransition,
  CPaper,
  CStack,
  CButton,
  CTypography,
  useOrbMode,
} from 'orbcafe-ui';
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

// Temporarily disabled - ChatMessage requires AgentUI export
// const initialWeatherMessages: ChatMessage[] = [
//   {
//     id: 'weather-ready',
//     type: 'assistant',
//     content: '在顶部搜索框输入天气问题，我会打开 AI Panel 并开始查询。',
//     timestamp: new Date('2024-01-01T09:00:00'),
//   },
// ];

export default function HomeDemoClient() {
  /* Temporarily disabled - requires AgentUI export
  const appendAssistantMessage = (runId: string, content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${runId}-assistant`,
        type: 'assistant',
        content,
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);
  };

  const runWeatherQuery = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isResponding) return;

    const runId = Date.now().toString();
    setPanelOpen(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${runId}-user`,
        type: 'user',
        content: trimmedContent,
        timestamp: new Date(),
      },
    ]);
    setIsResponding(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/weather-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmedContent }),
        signal: controller.signal,
      });
      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Weather agent request failed.');
      }

      appendAssistantMessage(runId, payload.answer || '天气查询完成。');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        appendAssistantMessage(runId, '查询已停止。');
      } else {
        appendAssistantMessage(
          runId,
          error instanceof Error ? `天气查询失败：${error.message}` : '天气查询失败。',
        );
      }
      setIsResponding(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const closePanel = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsResponding(false);
    setPanelOpen(false);
  };
  */

  return (
    <ExamplePageLayout
      appId="orbcafe-examples"
      appTitle=""
      navigationVariant="v2"
      searchPlacement="header"
      menuData={EXAMPLE_MENU}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      onUserRefresh={() => window.location.reload()}
      onUserLogout={() => window.location.assign('/login')}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey="dashboard-home" variant="fade" durationMs={180}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CPaper sx={{ padding: 24, borderRadius: 16 }}>
            <CStack spacing={1.25}>
              <CStack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', padding: '4px 12px', borderRadius: 16, border: '1px solid var(--orb-primary)', color: 'var(--orb-primary)' }}>
                  Examples workspace
                </span>
                <span style={{ fontSize: '0.875rem', padding: '4px 12px', borderRadius: 16, border: '1px solid var(--orb-divider)' }}>
                  Navigation island unified
                </span>
              </CStack>

              <CTypography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.05 }}>
                ORBCAFE dashboard
              </CTypography>
              <CTypography sx={{ maxWidth: 780, color: 'var(--orb-muted)' }}>
                This landing page now carries the full example navigation again. Login takes you here first, and the menu
                branches from dashboard, reports, operations, to the AI workbench instead of dumping straight into standard report.
              </CTypography>

              <CStack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Link href="/std-report" style={{ textDecoration: 'none' }}>
                  <CButton variant="contained">
                    Open standard report
                  </CButton>
                </Link>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <CButton variant="outlined">
                    Open login page
                  </CButton>
                </Link>
              </CStack>
            </CStack>
          </CPaper>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {overviewCards.map((card) => (
              <Link key={card.title} href={card.href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <CPaper
                  className="orb-card-hover"
                  sx={{
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid var(--orb-divider)',
                    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                  }}
                >
                  <CStack spacing={1}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.accent,
                        backgroundColor: `${card.accent}18`,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <CTypography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>{card.title}</CTypography>
                      <CTypography sx={{ marginTop: 4, color: 'var(--orb-muted)' }}>{card.description}</CTypography>
                    </div>
                  </CStack>
                </CPaper>
              </Link>
            ))}
          </div>
        </div>
      </CPageTransition>

      {/* Temporarily disabled - FloatingAgentPanel requires AgentUI export
      {panelOpen && (
        <FloatingAgentPanel
          width={AI_PANEL_WIDTH}
          top={88}
          bottom={88}
          inset={AI_PANEL_INSET}
          anchor={panelAnchor}
          onAnchorChange={setPanelAnchor}
          zIndex={1320}
          shellStyle={{
            borderRadius: 16,
            boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
          }}
          title="Weather Agent"
          description="Top search query result"
          agentStatus={isResponding ? 'running' : 'idle'}
          messages={messages}
          isResponding={isResponding}
          streamChunkSize={3}
          streamIntervalMs={18}
          onMessageStreamingComplete={(messageId) => {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)),
            );
            setIsResponding(false);
          }}
          headerActions={
            <button
              type="button"
              onClick={closePanel}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close AI Panel"
            >
              <X className="h-4 w-4" />
            </button>
          }
        />
      )}
      */}
    </ExamplePageLayout>
  );
}
