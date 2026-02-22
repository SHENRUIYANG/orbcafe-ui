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
    Checkbox
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import StarIcon from '@mui/icons-material/Star';

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
    const FONT_SIZE_SMALL = '0.75rem';
    // Keep API compatibility even when manage dialog entry is hidden.
    void onDelete;
    void onSetDefault;
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [variantName, setVariantName] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    const currentVariant = variants.find(v => v.id === currentVariantId);

    const handleSaveClick = () => {
        setVariantName(currentVariant?.name || 'New Variant');
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 'fit-content', fontSize: FONT_SIZE_SMALL }}>
                Variant:
            </Typography>
            <Autocomplete
                size="small"
                sx={{
                    width: 200,
                    '& .MuiInputBase-root': {
                        fontSize: FONT_SIZE_SMALL
                    },
                    '& .MuiInputBase-input': {
                        fontSize: FONT_SIZE_SMALL
                    },
                    '& .MuiAutocomplete-noOptions': {
                        fontSize: FONT_SIZE_SMALL
                    }
                }}
                noOptionsText={<Typography sx={{ fontSize: FONT_SIZE_SMALL }}>No options</Typography>}
                options={variants}
                getOptionLabel={(option) => option.name + (option.isDefault ? ' (Default)' : '')}
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
                                fontSize: FONT_SIZE_SMALL
                            }
                        }}
                        placeholder="Select Variant"
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
            
            <Tooltip title="Save View">
                <IconButton onClick={handleSaveClick} size="small" color="primary">
                    <SaveIcon />
                </IconButton>
            </Tooltip>

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>Save View</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="View Name"
                        fullWidth
                        variant="outlined"
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
                        label="Set as Default"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                        label="Public (All Users)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
