'use client';

import type { ComponentProps } from 'react';
import { CAppPageLayout } from 'orbcafe-ui';
import { BrandThemeSwitcher } from './BrandThemeSwitcher';

/**
 * CAppPageLayout with the examples-workspace extras baked in — currently the
 * Open Design brand-theme switcher in the header (right side, before the user
 * menu). Any rightHeaderSlot a page passes is preserved after the switcher.
 */
export const ExamplePageLayout = ({ rightHeaderSlot, ...props }: ComponentProps<typeof CAppPageLayout>) => (
  <CAppPageLayout
    {...props}
    rightHeaderSlot={
      <>
        <BrandThemeSwitcher />
        {rightHeaderSlot}
      </>
    }
  />
);
