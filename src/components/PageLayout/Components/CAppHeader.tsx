/**
 * 应用顶栏
 *
 * 内容大纲：
 * - 品牌、标题与左右插槽
 * - 中间 AI 输入条：功能入口、打开对话、语音；回车或语音完成才发送
 * - 语言、主题和用户菜单
 *
 * 作者：ORBAICODER
 * 版本：1.3.0
 * 日期：2026-10-14
 *
 * 作用：页面壳的顶栏。传入 onOpenPanel 后，AI 输入条可以不发送内容就重新打开对话面板。
 *
 * 代码逻辑大纲：
 * 1. 输入条自己持有草稿，提交后清空。
 * 2. 打开对话按钮只调用 onOpenPanel，不提交输入。panelOpen 为真时按钮隐藏。
 * 3. 语言和主题交给宿主回调。
 *
 * ChangeLog：
 * - 1.3.0 2026-10-14 面板打开时隐藏打开对话按钮。
 * - 1.2.0 2026-10-14 去掉输入条上的发送按钮，回车和语音完成仍然发送。
 * - 1.1.0 2026-10-14 AI 输入条增加打开对话按钮。
 */

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
  /** 不发送内容，只让宿主把已经关掉的对话面板再打开。 */
  onOpenPanel?: () => void;
  /** 面板已经打开时隐藏打开对话按钮。 */
  panelOpen?: boolean;
  maxWidth?: number | string;
  sx?: CSSProperties;
}

export const CAppHeaderSearch = ({
  searchPlaceholder,
  onSearch,
  onSearchAdd,
  onOpenPanel,
  panelOpen = false,
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
          {onOpenPanel && !panelOpen && (
            <CIconButton
              className="orb-app-header-ai-action"
              size="small"
              aria-label={t('header.searchOpenPanel')}
              tooltip={t('header.searchOpenPanel')}
              onClick={onOpenPanel}
            >
              <SapIcon name="message" size={16} />
            </CIconButton>
          )}
          <CIconButton
            className="orb-app-header-ai-action"
            size="small"
            onClick={() => void handleVoiceToggle()}
            tooltip={isRecording ? t('header.searchStopVoice') : t('header.searchStartVoice')}
            sx={{ color: isRecording ? 'var(--orb-err)' : undefined }}
          >
            <SapIcon name="microphone" size={16} />
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
  onOpenPanel,
  panelOpen,
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
            onOpenPanel={onOpenPanel}
            panelOpen={panelOpen}
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
