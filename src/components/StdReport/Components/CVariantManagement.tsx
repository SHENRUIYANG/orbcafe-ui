import { FormControlLabel, SaveIcon } from '../../../lib/orbis-compat';
import { useState } from 'react';
import { CButton, CTextField, CIconButton, CTooltip, CDialog, CCheckbox, CSelect } from '../../Atoms';
import { useOrbcafeI18n } from '../../../i18n';

export interface VariantMetadata {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    isPublic?: boolean;
    createdAt?: string;
    filters?: any;
    layout?: any;
    layoutId?: string;
    layoutRefs?: any[];
    scope?: string;
    appId?: string;
    tableKey?: string;
}

export interface CVariantManagementProps {
    variants: VariantMetadata[];
    currentVariantId?: string;
    onLoad: (variant: VariantMetadata) => void;
    onSave: (metadata: Omit<VariantMetadata, 'id' | 'createdAt'>) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

export const CVariantManagement = ({
    variants,
    currentVariantId,
    onLoad,
    onSave,
    onDelete,
    onSetDefault
}: CVariantManagementProps) => {
    const { t } = useOrbcafeI18n();
    // Keep API compatibility even when manage dialog entry is hidden.
    void onDelete;
    void onSetDefault;
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [variantName, setVariantName] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    const currentVariant = variants.find(v => v.id === currentVariantId);

    const handleSaveClick = () => {
        setVariantName(currentVariant?.name || t('variant.newVariant'));
        setIsDefault(currentVariant?.isDefault || false);
        setIsPublic(currentVariant?.isPublic || false);
        setSaveDialogOpen(true);
    };

    const handleConfirmSave = () => {
        onSave({
            name: variantName,
            isDefault,
            isPublic,
            description: ''
        });
        setSaveDialogOpen(false);
    };

    return (
        <div className="orb-variant-management">
            <CSelect
                size="small"
                fullWidth={false}
                sx={{
                    width: 'min(240px, 100%)',
                    '& .orb-inp': {
                        fontSize: '0.85rem',
                        backgroundColor: 'var(--orb-p50)',
                        borderColor: 'color-mix(in oklch, var(--orb-primary) 30%, var(--orb-border))',
                    }
                }}
                value={currentVariantId || ''}
                options={[
                    { value: '', label: t('variant.selectVariant'), disabled: true },
                    ...variants.map((variant) => ({
                        value: variant.id,
                        label: variant.name + (variant.isDefault ? ` (${t('variant.defaultSuffix')})` : ''),
                    })),
                ]}
                onChange={(event) => {
                    const selectedVariant = variants.find((variant) => variant.id === event.target.value);
                    if (selectedVariant) onLoad(selectedVariant);
                }}
            />

            <CTooltip title={t('variant.saveView')}>
                <CIconButton className="orb-variant-save-button" onClick={handleSaveClick} size="small" color="primary">
                    <SaveIcon fontSize="small" />
                </CIconButton>
            </CTooltip>

            {/* Save Dialog */}
            <CDialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <div className="orb-dialog-title">{t('variant.saveView')}</div>
                <div className="orb-dialog-content">
                    <CTextField
                        autoFocus
                        margin="dense"
                        label={t('variant.viewName')}
                        fullWidth
                        variant="outlined"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                    />
                    <FormControlLabel
                        control={<CCheckbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
                        label={t('variant.setDefault')}
                    />
                    <FormControlLabel
                        control={<CCheckbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                        label={t('variant.publicAllUsers')}
                    />
                </div>
                <div className="orb-dialog-actions">
                    <CButton onClick={() => setSaveDialogOpen(false)}>{t('common.cancel')}</CButton>
                    <CButton onClick={handleConfirmSave} variant="contained">{t('common.save')}</CButton>
                </div>
            </CDialog>
        </div>
    );
};
