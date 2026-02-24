import { useState } from 'react';
import { 
    Box, 
    Button, 
    Typography,
    Autocomplete, 
    TextField, 
    IconButton, 
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox,
    useTheme
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import StarIcon from '@mui/icons-material/Star';
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
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const FONT_SIZE_SMALL = '0.85rem';
    const FIELD_WIDTH = {
        xs: 'calc((100% - 1 * 16px) / 2)',
        sm: 'calc((100% - 2 * 16px) / 3)',
        md: 'calc((100% - 3 * 16px) / 4)',
        lg: 'calc((100% - 5 * 16px) / 6)',
    };
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
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                width: '100%',
                maxWidth: '100%',
            }}
        >
            <Autocomplete
                size="small"
                sx={{
                    width: FIELD_WIDTH,
                    '& .MuiInputBase-root': {
                        fontSize: FONT_SIZE_SMALL,
                        bgcolor: isDark ? 'rgba(25, 118, 210, 0.2)' : '#e7f1ff',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(144,202,249,0.45)' : 'rgba(25,118,210,0.45)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(144,202,249,0.7)' : 'rgba(25,118,210,0.65)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(144,202,249,0.9)' : 'rgba(25,118,210,0.85)',
                        },
                    },
                    '& .MuiInputBase-input': {
                        fontSize: FONT_SIZE_SMALL
                    },
                    '& .MuiAutocomplete-noOptions': {
                        fontSize: FONT_SIZE_SMALL
                    }
                }}
                noOptionsText={<Typography sx={{ fontSize: FONT_SIZE_SMALL }}>{t('variant.noOptions')}</Typography>}
                options={variants}
                getOptionLabel={(option) => option.name + (option.isDefault ? ` (${t('variant.defaultSuffix')})` : '')}
                value={currentVariant || null}
                onChange={(_, newValue) => {
                    if (newValue) onLoad(newValue);
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        variant="outlined" 
                        size="small" 
                        InputProps={{
                            ...params.InputProps,
                            sx: {
                                fontSize: FONT_SIZE_SMALL,
                                color: isDark ? '#E3F2FD' : '#0D47A1',
                            }
                        }}
                        placeholder={t('variant.selectVariant')}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ flex: 1, fontSize: FONT_SIZE_SMALL }}>{option.name}</Typography>
                            {option.isDefault && <StarIcon fontSize="small" color="action" />}
                        </Box>
                    </li>
                )}
            />
            
            <Tooltip title={t('variant.saveView')}>
                <IconButton onClick={handleSaveClick} size="small" color="primary">
                    <SaveIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>{t('variant.saveView')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t('variant.viewName')}
                        fullWidth
                        variant="outlined"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
                        label={t('variant.setDefault')}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                        label={t('variant.publicAllUsers')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleConfirmSave} variant="contained">{t('common.save')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
