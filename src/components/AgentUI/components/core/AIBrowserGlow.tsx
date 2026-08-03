'use client'

import React from 'react'

export type AIBrowserGlowColors = readonly [string, string, string]

export interface AIBrowserGlowProps {
  active?: boolean
  /** Compatibility: kept as a 3-tuple; only the first color is used as the edge line color. */
  colors?: AIBrowserGlowColors
  zIndex?: number
}

/** ORBIS brand default: 2px primary edge line while the agent runs — no color wash. */
const defaultColors: AIBrowserGlowColors = ['#154194', '#154194', '#154194']

const styles = `
.orbcafe-ai-browser-glow {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--orbcafe-ai-glow-z-index);
  pointer-events: none;
  overflow: hidden;
  contain: paint;
  opacity: 0;
  transition: opacity 260ms ease;
  --orbcafe-ai-glow-line: var(--orb-primary, #154194);
}

.orbcafe-ai-browser-glow[data-active='true'] {
  opacity: 1;
}

.orbcafe-ai-browser-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--orbcafe-ai-glow-line);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--orbcafe-ai-glow-line) 14%, transparent);
  animation: orbcafeAiGlowBreath 2.4s ease-in-out infinite;
}

@keyframes orbcafeAiGlowBreath {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
`

export const AIBrowserGlow: React.FC<AIBrowserGlowProps> = ({
  active = false,
  colors = defaultColors,
  zIndex = 2147483000,
}) => {
  const style = {
    '--orbcafe-ai-glow-line': colors[0],
    '--orbcafe-ai-glow-z-index': zIndex,
  } as React.CSSProperties

  return (
    <>
      <style>{styles}</style>
      <div
        className="orbcafe-ai-browser-glow"
        data-active={active ? 'true' : 'false'}
        style={style}
        aria-hidden="true"
      />
    </>
  )
}

export default AIBrowserGlow
