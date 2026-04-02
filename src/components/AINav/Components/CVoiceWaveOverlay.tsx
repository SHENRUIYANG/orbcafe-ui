'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import type { CVoiceWaveOverlayProps } from '../types';

const COrbCanvas = dynamic(() => import('./COrbCanvas').then((mod) => mod.COrbCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-transparent" />,
});

export function CVoiceWaveOverlay({ isRecording }: CVoiceWaveOverlayProps) {
  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="absolute inset-0">
              <COrbCanvas
                hue={0}
                hoverIntensity={0.5}
                rotateOnHover
                forceHoverState
                backgroundColor="transparent"
              />
            </div>

            <div className="relative z-10 h-full w-1/3 mix-blend-overlay opacity-80">
              <COrbCanvas
                hue={10}
                hoverIntensity={0.8}
                rotateOnHover
                forceHoverState
                backgroundColor="transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const VoiceWaveOverlay = CVoiceWaveOverlay;
