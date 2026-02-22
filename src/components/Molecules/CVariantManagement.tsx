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
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Variant:</Typography>
        <Box 
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
            <Typography variant="body2" sx={{ flexGrow: 1, mr: 1, fontSize: '0.75rem' }}>
                {currentVariant ? currentVariant.name : 'Select Variant'}
            </Typography>
            <ArrowDropDownIcon fontSize="small" color="action" />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Tooltip title={'Save as Variant...'}>
        <IconButton onClick={handleOpenSaveDialog} size="small" color="primary">
          <SaveIcon />
        </IconButton>
      </Tooltip>

      {/* --- Dropdown Menu --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <MenuItem disabled>
          <Typography variant="caption">{'Select a Variant to Load'}</Typography>
        </MenuItem>
        <Divider />
        {variants.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">{'No variants saved'}</Typography>
          </MenuItem>
        )}
        {variants.map((variant) => (
          <MenuItem 
            key={variant.id} 
            onClick={() => handleVariantSelect(variant)}
            selected={variant.id === currentVariantId}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', mr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                            {variant.name}
                        </Typography>
                        {variant.executeOnLoad && <PlayArrowIcon fontSize="small" color="success" sx={{ fontSize: 16 }} />}
                    </Box>
                    {variant.description && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                        {variant.description}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={variant.isDefault ? 'Remove Default' : 'Set as Default'}>
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(variant.id);
                            }}
                        >
                            {variant.isDefault ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {variant.id !== 'STANDARD' && (
                        <Tooltip title={'Delete'}>
                            <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(variant.id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* --- Save Dialog --- */}
      <Dialog open={isSaveDialogOpen} onClose={() => setIsSaveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{'Save Variant'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={'Variant Name'}
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              fullWidth
              autoFocus
              size="small"
              helperText={"e.g., 'My Urgent Orders'"}
            />
            {variants.some(v => v.name === newVariantName) && (
              <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                {'Warning: Existing variant will be overwritten'}
              </Typography>
            )}
            <TextField
              label={'Description'}
              value={newVariantDesc}
              onChange={(e) => setNewVariantDesc(e.target.value)}
              fullWidth
              size="small"
            />
            
            <Typography variant="subtitle2" sx={{ mt: 1 }}>{'Options'}</Typography>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={saveOptions.isDefault}
                  onChange={(e) => setSaveOptions({...saveOptions, isDefault: e.target.checked})}
                />
              }
              label={'Use as Default Variant'}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveOptions.executeOnLoad}
                  onChange={(e) => setSaveOptions({ ...saveOptions, executeOnLoad: e.target.checked })}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlayArrowIcon fontSize="small" color="action" />
                  <Typography variant="body2">{'Auto-Search'}</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox 
                  checked={saveOptions.isPublic}
                  onChange={(e) => setSaveOptions({...saveOptions, isPublic: e.target.checked})}
                />
              }
              label={'Public (Visible to all users)'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveDialogOpen(false)}>{'Cancel'}</Button>
          <Button onClick={handleSaveConfirm} variant="contained" disabled={!newVariantName}>
            {'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
