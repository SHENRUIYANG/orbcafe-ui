import { CButton, CCheckbox, CDialog, CDivider, CIconButton, CListItemIcon, CListItemText, CMenu, CTextField, CTooltip, CTypography, DeleteIcon, SaveIcon, StarBorderIcon, StarIcon, ViewQuiltIcon } from '../../lib/orbis-compat';
/**
import {  CButton, CIconButton, CTypography, CTextField, CCheckbox, CDialog, CTooltip, CMenu, CDivider } from "../Atoms";
 * @file 10_Frontend/components/sap/ui/Common/Molecules/CLayoutManagement.tsx
 *
 * @summary Core frontend CLayoutManagement module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2026-01-06
 *
 * @description
 * This file is responsible for:
 *  - Implementing CLayoutManagement functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 *
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CLayoutManagement
 * 3. Export the resulting APIs, hooks, or components for reuse
 *
 * @changelog
 * V1.0.0 - 2026-01-06 - Initial creation
 */

'use client';

import React, { useState } from 'react';
import { useOrbcafeI18n } from '../../i18n';

// --- Interfaces ---

export interface LayoutMetadata {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  layoutData: any;
}

export interface CLayoutManagementProps {
  layouts: LayoutMetadata[];
  currentLayoutId?: string;
  onLoad: (layout: LayoutMetadata) => void;
  onSave: (metadata: Omit<LayoutMetadata, 'id' | 'createdAt' | 'layoutData'>) => void;
  onDelete: (layoutId: string) => void;
  onSetDefault: (layoutId: string) => void;
}

/**
 * CLayoutManagement
 *
 * A molecule that manages Table Layouts (Columns, Sort, Grouping).
 * It allows users to:
 * 1. Save current table configuration as a Layout.
 * 2. Load existing layouts.
 * 3. Manage layouts (Delete, Set Default).
 */
export const CLayoutManagement: React.FC<CLayoutManagementProps> = ({
  layouts,
  currentLayoutId,
  onLoad,
  onSave,
  onDelete,
  onSetDefault
}) => {
  const { t } = useOrbcafeI18n();
  // --- State ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Save Dialog State
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDesc, setNewLayoutDesc] = useState('');
  const [saveOptions, setSaveOptions] = useState({
    isDefault: false,
    isPublic: false
  });

  const currentLayout = layouts.find(l => l.id === currentLayoutId);

  // --- Handlers ---

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLayoutSelect = (layout: LayoutMetadata) => {
    onLoad(layout);
    handleMenuClose();
  };

  const handleOpenSaveDialog = () => {
    setNewLayoutName('');
    setNewLayoutDesc('');
    setSaveOptions({
      isDefault: false,
      isPublic: false
    });
    setIsSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveConfirm = () => {
    if (!newLayoutName.trim()) return;

    onSave({
      name: newLayoutName,
      description: newLayoutDesc,
      ...saveOptions
    });
    setIsSaveDialogOpen(false);
  };

  return (
    <div className="orb-layout-actions" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {/* Layout management is the single entry for save, load and maintenance. */}
      <CTooltip title={t('layout.layoutOptions')}>
        <CIconButton onClick={handleMenuOpen} color={currentLayout ? 'primary' : 'default'} size="small">
            <ViewQuiltIcon fontSize="small" />
        </CIconButton>
      </CTooltip>

      {/* --- Dropdown Menu --- */}
      <CMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        align="end"
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <option disabled>
          <CTypography variant="caption">{t('layout.selectLayout')}</CTypography>
        </option>

        {/* Save Current Action */}
        <option onClick={handleOpenSaveDialog}>
            <CListItemIcon>
                <SaveIcon fontSize="small" />
            </CListItemIcon>
            <CListItemText>{t('layout.saveCurrentLayout')}</CListItemText>
        </option>

        <CDivider />

        {layouts.length === 0 && (
          <option disabled>
            <CTypography variant="body2" color="text.secondary">{t('layout.noSavedLayouts')}</CTypography>
          </option>
        )}

        {layouts.map((layout, index) => (
          <option
            key={layout.id || index}
            onClick={() => handleLayoutSelect(layout)}
            selected={layout.id === currentLayoutId}
          >
            <div sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <div sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', mr: 1 }}>
                    <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CTypography variant="body2" fontWeight={layout.id === currentLayoutId ? 'bold' : 'normal'} noWrap>
                            {layout.name}
                        </CTypography>
                    </div>
                    {layout.description && (
                        <CTypography variant="caption" color="text.secondary" noWrap>
                        {layout.description}
                        </CTypography>
                    )}
                </div>

                <div sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <CTooltip title={layout.isDefault ? t('layout.removeDefault') : t('layout.setAsDefault')}>
                        <CIconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(layout.id);
                            }}
                        >
                            {layout.isDefault ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                        </CIconButton>
                    </CTooltip>

                    <CTooltip title={t('common.delete')}>
                        <CIconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(layout.id);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </CIconButton>
                    </CTooltip>
                </div>
            </div>
          </option>
        ))}
      </CMenu>

      {/* --- Save Dialog --- */}
      <CDialog
        open={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        className="orb-layout-save-dialog"
        title={t('layout.saveLayout')}
        actions={(
          <>
            <CButton variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>
              {t('common.cancel')}
            </CButton>
            <CButton onClick={handleSaveConfirm} variant="primary" disabled={!newLayoutName.trim()}>
              {t('common.save')}
            </CButton>
          </>
        )}
      >
        <div className="orb-layout-save-form">
            <CTextField
              label={t('layout.layoutName')}
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              fullWidth
              autoFocus
              size="small"
              helperText={t('layout.layoutNameHelper')}
            />
             {layouts.some(l => l.name === newLayoutName) && (
               <CTypography className="orb-layout-save-warning" variant="caption" color="warning.main">
                 {t('layout.warningOverwrite')}
               </CTypography>
             )}
            <CTextField
              label={t('layout.layoutDescription')}
              value={newLayoutDesc}
              onChange={(e) => setNewLayoutDesc(e.target.value)}
              fullWidth
              size="small"
            />

            <CCheckbox
              className="orb-layout-save-option"
              checked={saveOptions.isDefault}
              onChange={(e) => setSaveOptions({...saveOptions, isDefault: e.target.checked})}
              label={t('layout.useAsDefault')}
            />

            <CCheckbox
              className="orb-layout-save-option"
              checked={saveOptions.isPublic}
              onChange={(e) => setSaveOptions({...saveOptions, isPublic: e.target.checked})}
              label={t('layout.publicAllUsers')}
            />
        </div>
      </CDialog>
    </div>
  );
};
