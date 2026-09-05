import { Avatar, CDivider, CListItemIcon, CStack, CTooltip, DarkModeIcon, LightModeIcon, LockResetIcon, LogoutIcon, SettingsIcon, TranslateIcon, useColorScheme } from '../../lib/orbis-compat';
/**
 * @file 10_Frontend/components/sap/ui/Common/Molecules/CAppHeaderActions.tsx
 *
 * @summary Core frontend CAppHeaderActions module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 *
 * @description
 * This file is responsible for:
 *  - Implementing CAppHeaderActions functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 *
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CAppHeaderActions
 * 3. Export the resulting APIs, hooks, or components for reuse
 *
 * @changelog
 * V1.0.0 - 2025-01-19 - Initial creation
 */

/**
 * File Overview
 *
 * START CODING
 *
 * --------------------------
 * SECTION 1: CAppHeaderActions Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CIconButton, CMenu } from "./../Atoms";

export const CAppHeaderActions = () => {
    const router = useRouter();
    const { i18n } = useTranslation();
    const { mode, setMode, systemMode } = useColorScheme();
    const effectiveMode = mode === 'system' ? systemMode : mode;

    const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
    const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

    // Theme Toggle
    const toggleTheme = () => {
        setMode(effectiveMode === 'light' ? 'dark' : 'light');
    };

    // Language Handlers
    const handleLangClick = (event: React.MouseEvent<HTMLElement>) => {
        setLangAnchorEl(event.currentTarget);
    };

    const handleLangClose = (lang?: string) => {
        if (lang) {
            i18n.changeLanguage(lang);
        }
        setLangAnchorEl(null);
    };

    // User Menu Handlers
    const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
        setUserAnchorEl(event.currentTarget);
    };

    const handleUserClose = () => {
        setUserAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserClose();
        router.push('/login');
    };

    const iconButtonStyle = {
        color: 'var(--orb-fg)',
        backgroundColor: effectiveMode === 'light' ? 'color-mix(in oklch, var(--orb-canvas) 80%, transparent)' : 'color-mix(in oklch, var(--orb-fg) 10%, transparent)',
        backdropFilter: 'blur(10px)',
        '&:hover': { backgroundColor: effectiveMode === 'light' ? 'var(--orb-canvas)' : 'color-mix(in oklch, var(--orb-fg) 20%, transparent)' }
    };

    return (
        <CStack direction="row" spacing={2} alignItems="center">
            {/* Theme Toggle */}
            <CTooltip title="Switch Theme">
                <CIconButton onClick={toggleTheme} size="small" sx={iconButtonStyle}>
                    {effectiveMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </CIconButton>
            </CTooltip>

            {/* Language Toggle */}
            <CTooltip title="Switch Language">
                <CIconButton onClick={handleLangClick} size="small" sx={iconButtonStyle}>
                    <TranslateIcon fontSize="small" />
                </CIconButton>
            </CTooltip>

            {/* User Menu */}
            <CTooltip title="User Settings">
                <CIconButton
                    onClick={handleUserClick}
                    size="small"
                    sx={{ ...iconButtonStyle, p: 0, ml: 1 }}
                >
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24, fontSize: '0.875rem' }}>U</Avatar>
                </CIconButton>
            </CTooltip>

            {/* Language Menu */}
            <CMenu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={() => handleLangClose()}
            >
                <option onClick={() => handleLangClose('EN')}>English</option>
                <option onClick={() => handleLangClose('ZH')}>中文 (Chinese)</option>
                <option onClick={() => handleLangClose('JA')}>日本語 (Japanese)</option>
                <option onClick={() => handleLangClose('DE')}>Deutsch (German)</option>
                <option onClick={() => handleLangClose('FR')}>Français (French)</option>
            </CMenu>

            {/* User Menu */}
            <CMenu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }
                }}
            >
                <option onClick={handleUserClose}>
                    <CListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </CListItemIcon>
                    Personalization
                </option>
                <option onClick={handleUserClose}>
                    <CListItemIcon>
                        <LockResetIcon fontSize="small" />
                    </CListItemIcon>
                    Change Password
                </option>
                <CDivider />
                <option onClick={handleLogout}>
                    <CListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </CListItemIcon>
                    Logout
                </option>
            </CMenu>
        </CStack>
    );
};
