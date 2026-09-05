'use client';

import { useCallback, useState, type FormEvent, type CSSProperties } from 'react';
import { SapIcon, Globe, Sun, Moon, Settings, LogOut, RefreshCw } from '@/components/Icons';
import { CIconButton, CAvatar, CTypography } from '../../Atoms';
import { CMenu } from '../../Atoms/CMenu';
import type { CAppHeaderProps, CAppHeaderUserMenuItem } from '../types';
import { useOrbcafeI18n } from '../../../i18n';
import type { OrbcafeLocale } from '../../../i18n';
import { useVoiceInput } from '../../AINav/Hooks/useVoiceInput';
import { useOrbMode } from '../../../lib/theme';

const DEFAULT_LOCALE_OPTIONS: OrbcafeLocale[] = ['en', 'zh', 'fr', 'de', 'ja', 'ko'];
const DEFAULT_LOCALE_LABELS: Record<OrbcafeLocale, string> = {
  en: 'EN',
  zh: '中文',
  fr: 'FR',
  de: 'DE',
  ja: '日本語',
  ko: '한국어',
};

export interface CAppHeaderSearchProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onSearchAdd?: () => void;
  maxWidth?: number | string;
  sx?: CSSProperties;
}

export const CAppHeaderSearch = ({
  searchPlaceholder,
  onSearch,
  onSearchAdd,
  maxWidth = 540,
  sx,
}: CAppHeaderSearchProps) => {
  const { t } = useOrbcafeI18n();
  const [query, setQuery] = useState('');

  const submitSearch = useCallback(
    (rawQuery = query) => {
      const trimmedQuery = rawQuery.trim();
      if (trimmedQuery) {
        setQuery('');
        onSearch?.(trimmedQuery);
      }
    },
    [onSearch, query],
  );

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const { isRecording, startRecording, stopRecording } = useVoiceInput({
    onTextUpdate: setQuery,
    onComplete: (text) => {
      setQuery(text);
      submitSearch(text);
    },
    onError: (error) => {
      console.error('Header voice input error:', error);
    },
  });

  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const effectiveSearchPlaceholder = searchPlaceholder || t('header.searchPlaceholder');
  const canSubmitSearch = query.trim().length > 0;

  return (
    <form
      className="orb-app-header-search"
      onSubmit={handleSearchSubmit}
      style={{
        width: '100%',
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        ...sx,
      }}
    >
      <div className="orb-inp-adornment-wrap orb-app-header-search-shell" style={{ background: 'var(--orb-surface)', border: '1px solid var(--orb-border)', borderRadius: 999, paddingRight: 4 }}>
        <div className="orb-inp-adornment">
          <CIconButton className="orb-app-header-ai-action" size="small" onClick={onSearchAdd} tooltip={t('header.searchAddFeature')}>
            <SapIcon name="add" size={16} />
          </CIconButton>
        </div>
        <input
          className="orb-inp orb-inp-dense orb-app-header-ai-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={effectiveSearchPlaceholder}
          style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
        />
        <div className="orb-inp-adornment orb-inp-adornment-end">
          <CIconButton
            className="orb-app-header-ai-action"
            size="small"
            onClick={() => void handleVoiceToggle()}
            tooltip={isRecording ? t('header.searchStopVoice') : t('header.searchStartVoice')}
            sx={{ color: isRecording ? 'var(--orb-err)' : undefined }}
          >
            <SapIcon name="microphone" size={16} />
          </CIconButton>
          <CIconButton className="orb-app-header-ai-action" size="small" type="submit" disabled={!canSubmitSearch} tooltip={t('header.searchSend')}>
            <SapIcon name="paperPlane" size={16} />
          </CIconButton>
        </div>
      </div>
    </form>
  );
};

export const CAppHeader = ({
  appTitle,
  logo,
  onToggleMode,
  locale: localeProp,
  localeLabel,
  localeOptions,
  onLocaleChange,
  searchPlaceholder,
  showSearch = false,
  onSearch,
  onSearchAdd,
  user,
  onUserRefresh,
  onUserSetting,
  onUserLogout,
  userMenuItems,
  leftSlot,
  rightSlot,
}: CAppHeaderProps) => {
  const { t, locale } = useOrbcafeI18n();
  const mode = useOrbMode();
  const effectiveLocale = localeProp || locale;
  const effectiveLocaleLabel = localeLabel || DEFAULT_LOCALE_LABELS[effectiveLocale];
  const effectiveLocaleOptions = localeOptions || DEFAULT_LOCALE_OPTIONS;

  const themeIcon =
    mode === 'dark' ? <Moon size={15} /> : <Sun size={15} />;

  const themeTooltip = mode === 'dark' ? t('header.theme.dark') : t('header.theme.light');

  const defaultUserMenuItems: CAppHeaderUserMenuItem[] = [
    ...(onUserRefresh ? [{ key: 'refresh', label: t('header.menu.refresh'), icon: <RefreshCw size={15} />, onClick: onUserRefresh }] : []),
    ...(onUserSetting ? [{ key: 'settings', label: t('header.menu.setting'), icon: <Settings size={16} />, onClick: onUserSetting }] : []),
    ...(onUserLogout ? [{ key: 'logout', label: t('header.menu.logout'), icon: <LogOut size={16} />, onClick: onUserLogout }] : []),
  ];
  const effectiveUserMenuItems = userMenuItems || defaultUserMenuItems;

  const localeMenuItems = effectiveLocaleOptions.map(loc => ({
    label: DEFAULT_LOCALE_LABELS[loc],
    onClick: () => {
      onLocaleChange?.(loc);
      window.requestAnimationFrame(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    },
    disabled: loc === effectiveLocale,
  }));

  return (
    <header className="orb-app-header">
      <div className="orb-app-header-brand">
        {leftSlot}
        {logo === null ? null : logo || (
          <div className="orb-app-header-default-logo" aria-label="ORBCAFE">
            <SapIcon name="product" size={20} />
          </div>
        )}
        {appTitle && (
          <CTypography variant="h4" sx={{ fontWeight: 700 }}>
            {appTitle}
          </CTypography>
        )}
      </div>

      <div className="orb-app-header-center">
        {showSearch && (
          <CAppHeaderSearch
            searchPlaceholder={searchPlaceholder}
            onSearch={onSearch}
            onSearchAdd={onSearchAdd}
          />
        )}
      </div>

      <div className="orb-app-header-actions">
        <div className="orb-app-header-utilities">
          {onLocaleChange ? (
            <CMenu
              triggerLabel={effectiveLocaleLabel}
              trigger={
                <button type="button" className="orb-icon-btn orb-app-header-locale">
                  <Globe size={15} />
                  <span className="orb-label">{effectiveLocaleLabel}</span>
                </button>
              }
              items={localeMenuItems}
              align="end"
            />
          ) : (
            <div className="orb-app-header-locale" aria-label={effectiveLocaleLabel}>
              <Globe size={15} />
              <span className="orb-label">{effectiveLocaleLabel}</span>
            </div>
          )}

          <CIconButton
            className="orb-app-header-theme"
            size="small"
            onClick={onToggleMode}
            tooltip={themeTooltip}
          >
            {themeIcon}
          </CIconButton>
        </div>

        {user && <span className="orb-app-header-divider" aria-hidden="true" />}

        {user && (
          <CMenu
            triggerLabel={user.name}
            trigger={
              <button type="button" className="orb-app-header-user-trigger">
                <span className="orb-app-header-user-copy">
                  <CTypography variant="body2" className="orb-app-header-user-name">
                    {user.name}
                  </CTypography>
                  {user.subtitle && (
                    <CTypography
                      variant="caption"
                      muted
                      className="orb-app-header-user-subtitle"
                      title={user.subtitle}
                    >
                      {user.subtitle}
                    </CTypography>
                  )}
                </span>
                <CAvatar src={user.avatarSrc} alt={user.name} size={32}>
                  {user.avatarText || user.name.slice(0, 1).toUpperCase()}
                </CAvatar>
              </button>
            }
            items={effectiveUserMenuItems.map(item => ({
              label: item.label,
              onClick: item.onClick,
              disabled: item.disabled,
              icon: item.icon,
            }))}
            align="end"
          />
        )}

        {rightSlot}
      </div>
    </header>
  );
};
