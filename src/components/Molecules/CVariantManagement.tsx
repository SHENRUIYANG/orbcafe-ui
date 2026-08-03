import { ArrowDropDownIcon, DeleteIcon, FormControlLabel, PlayArrowIcon, SaveIcon, StarBorderIcon, StarIcon } from '../../lib/orbis-compat';
/**
 * @file 10_Frontend/components/sap/ui/Common/Molecules/CVariantManagement.tsx
 *
 * @summary Core frontend CVariantManagement module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 *
 * @description
 * This file is responsible for:
 *  - Implementing CVariantManagement functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 *
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CVariantManagement
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
 * SECTION 1: CVariantManagement Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client';

import React, { useState } from 'react';
import { CButton, CDialog, CIconButton, CMenu, CTextField, CTooltip, CTypography, CCheckbox, CDivider } from "./../Atoms";

// --- Interfaces ---

/**
 * Variant Metadata Interface
 * Represents the "Header" information of a variant, similar to SAP VARID table.
 */
export interface VariantMetadata {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  executeOnLoad: boolean; // SAP: "Execute immediately"
  isPublic: boolean;      // SAP: User-specific vs Global
  scope: 'Search' | 'Layout' | 'Both'; // What does this variant contain?
  createdAt: string;
  filters?: Record<string, any> | any[];
  layout?: any;
  layoutId?: string | any[]; // Reference to an independent layout
  layoutRefs?: any[]; // For multi-table layout references
}

export interface CVariantManagementProps {
  variants: VariantMetadata[];
  currentVariantId?: string;
  onLoad: (variant: VariantMetadata) => void;
  onSave: (metadata: Omit<VariantMetadata, 'id' | 'createdAt'>) => void;
  onDelete: (variantId: string) => void;
  onSetDefault: (variantId: string) => void;
}

/**
 * CVariantManagement (Component Variant Management)
 *
 * A comprehensive molecule that replicates SAP GUI's Variant Management features.
 * It allows users to:
 * 1. Save current state (Search Criteria + Layout) as a Variant.
 * 2. Load existing variants.
 * 3. Manage variants (Delete, Set Default, Toggle Public/Private).
 * 4. Configure "Execute on Load" behavior.
 */
export const CVariantManagement: React.FC<CVariantManagementProps> = ({
  variants,
  currentVariantId,
  onLoad,
  onSave,
  onDelete,
  onSetDefault
}) => {
  // --- State ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Save Dialog State
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantDesc, setNewVariantDesc] = useState('');
  const [saveOptions, setSaveOptions] = useState({
    isDefault: false,
    executeOnLoad: false,
    isPublic: false,
    scope: 'Both' as 'Search' | 'Layout' | 'Both'
  });

  const currentVariant = variants.find(v => v.id === currentVariantId);

  // --- Handlers ---

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVariantSelect = (variant: VariantMetadata) => {
    onLoad(variant);
    handleMenuClose();
  };

  const handleOpenSaveDialog = () => {
    setNewVariantName('');
    setNewVariantDesc('');
    setSaveOptions({
      isDefault: false,
      executeOnLoad: false,
      isPublic: false,
      scope: 'Both'
    });
    setIsSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveConfirm = () => {
    if (!newVariantName.trim()) return;

    onSave({
      name: newVariantName,
      description: newVariantDesc,
      ...saveOptions
    });
    setIsSaveDialogOpen(false);
  };

  return (
    <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CTypography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Variant:</CTypography>
        <div
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                pl: 1,
                pr: 0.5,
                py: 0.5,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: 150
            }}
            onClick={handleMenuOpen}
        >
            <CTypography variant="body2" sx={{ flexGrow: 1, mr: 1, fontSize: '0.75rem' }}>
                {currentVariant ? currentVariant.name : 'Select Variant'}
            </CTypography>
            <ArrowDropDownIcon fontSize="small" color="action" />
        </div>
      </div>

      {/* Quick Actions */}
      <CTooltip title={'Save as Variant...'}>
        <CIconButton onClick={handleOpenSaveDialog} size="small" color="primary">
          <SaveIcon />
        </CIconButton>
      </CTooltip>

      {/* --- Dropdown Menu --- */}
      <CMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <option disabled>
          <CTypography variant="caption">{'Select a Variant to Load'}</CTypography>
        </option>
        <CDivider />
        {variants.length === 0 && (
          <option disabled>
            <CTypography variant="body2" color="text.secondary">{'No variants saved'}</CTypography>
          </option>
        )}
        {variants.map((variant) => (
          <option
            key={variant.id}
            onClick={() => handleVariantSelect(variant)}
            selected={variant.id === currentVariantId}
          >
            <div sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <div sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', mr: 1 }}>
                    <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CTypography variant="body2" fontWeight="bold" noWrap>
                            {variant.name}
                        </CTypography>
                        {variant.executeOnLoad && <PlayArrowIcon fontSize="small" color="success" sx={{ fontSize: 16 }} />}
                    </div>
                    {variant.description && (
                        <CTypography variant="caption" color="text.secondary" noWrap>
                        {variant.description}
                        </CTypography>
                    )}
                </div>

                <div sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <CTooltip title={variant.isDefault ? 'Remove Default' : 'Set as Default'}>
                        <CIconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(variant.id);
                            }}
                        >
                            {variant.isDefault ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                        </CIconButton>
                    </CTooltip>

                    {variant.id !== 'STANDARD' && (
                        <CTooltip title={'Delete'}>
                            <CIconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(variant.id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </CIconButton>
                        </CTooltip>
                    )}
                </div>
            </div>
          </option>
        ))}
      </CMenu>

      {/* --- Save Dialog --- */}
      <CDialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <div className="orb-dialog-title">{'Save Variant'}</div>
        <div className="orb-dialog-content">
          <div sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <CTextField
              label={'Variant Name'}
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              fullWidth
              autoFocus
              size="small"
              helperText={"e.g., 'My Urgent Orders'"}
            />
            {variants.some(v => v.name === newVariantName) && (
              <CTypography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                {'Warning: Existing variant will be overwritten'}
              </CTypography>
            )}
            <CTextField
              label={'Description'}
              value={newVariantDesc}
              onChange={(e) => setNewVariantDesc(e.target.value)}
              fullWidth
              size="small"
            />

            <CTypography variant="subtitle2" sx={{ mt: 1 }}>{'Options'}</CTypography>

            <FormControlLabel
              control={
                <CCheckbox
                  checked={saveOptions.isDefault}
                  onChange={(e) => setSaveOptions({...saveOptions, isDefault: e.target.checked})}
                />
              }
              label={'Use as Default Variant'}
            />

            <FormControlLabel
              control={
                <CCheckbox
                  checked={saveOptions.executeOnLoad}
                  onChange={(e) => setSaveOptions({ ...saveOptions, executeOnLoad: e.target.checked })}
                />
              }
              label={
                <div sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlayArrowIcon fontSize="small" color="action" />
                  <CTypography variant="body2">{'Auto-Search'}</CTypography>
                </div>
              }
            />

            <FormControlLabel
              control={
                <CCheckbox
                  checked={saveOptions.isPublic}
                  onChange={(e) => setSaveOptions({...saveOptions, isPublic: e.target.checked})}
                />
              }
              label={'Public (Visible to all users)'}
            />
          </div>
        </div>
        <div className="orb-dialog-actions">
          <CButton onClick={() => setIsSaveDialogOpen(false)}>{'Cancel'}</CButton>
          <CButton onClick={handleSaveConfirm} variant="contained" disabled={!newVariantName}>
            {'Save'}
          </CButton>
        </div>
      </CDialog>
    </div>
  );
};
