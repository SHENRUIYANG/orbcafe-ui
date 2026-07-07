'use client'

import React from 'react'

export type AIBrowserGlowColors = readonly [string, string, string]

export interface AIBrowserGlowProps {
  active?: boolean
  colors?: AIBrowserGlowColors
  zIndex?: number
}

const defaultColors: AIBrowserGlowColors = ['#ff3860', '#24e070', '#3090ff']

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
  clip-path: inset(0);
  opacity: 0;
  transition: opacity 260ms ease;
  --orbcafe-ai-glow-a: #ff3860;
  --orbcafe-ai-glow-b: #24e070;
  --orbcafe-ai-glow-c: #3090ff;
}

.orbcafe-ai-browser-glow[data-active='true'] {
  opacity: 1;
}

.orbcafe-ai-browser-glow::before,
.orbcafe-ai-browser-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orbcafe-ai-browser-glow::before {
  border: 1px solid color-mix(in srgb, var(--orbcafe-ai-glow-c) 54%, transparent);
  box-shadow:
    inset 0 0 18px color-mix(in srgb, var(--orbcafe-ai-glow-a) 56%, transparent),
    inset 0 0 38px color-mix(in srgb, var(--orbcafe-ai-glow-b) 44%, transparent),
    inset 0 0 74px color-mix(in srgb, var(--orbcafe-ai-glow-c) 36%, transparent),
    0 0 22px color-mix(in srgb, var(--orbcafe-ai-glow-a) 42%, transparent);
  animation: orbcafeAIBrowserGlowPulse 2.2s ease-in-out infinite;
}

.orbcafe-ai-browser-glow::after {
  background:
    linear-gradient(90deg, var(--orbcafe-ai-glow-a), var(--orbcafe-ai-glow-b), var(--orbcafe-ai-glow-c)) top / 100% 5px no-repeat,
    linear-gradient(90deg, var(--orbcafe-ai-glow-c), var(--orbcafe-ai-glow-b), var(--orbcafe-ai-glow-a)) bottom / 100% 5px no-repeat,
    linear-gradient(180deg, var(--orbcafe-ai-glow-a), var(--orbcafe-ai-glow-b), var(--orbcafe-ai-glow-c)) left / 5px 100% no-repeat,
    linear-gradient(180deg, var(--orbcafe-ai-glow-c), var(--orbcafe-ai-glow-b), var(--orbcafe-ai-glow-a)) right / 5px 100% no-repeat;
  filter: blur(9px) saturate(1.35);
  opacity: 0.78;
}

@keyframes orbcafeAIBrowserGlowPulse {
  0%, 100% { opacity: 0.68; }
  50% { opacity: 0.98; }
}
`

export const AIBrowserGlow: React.FC<AIBrowserGlowProps> = ({
  active = false,
  colors = defaultColors,
  zIndex = 2147483000,
}) => {
  const style = {
    '--orbcafe-ai-glow-a': colors[0],
    '--orbcafe-ai-glow-b': colors[1],
    '--orbcafe-ai-glow-c': colors[2],
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
