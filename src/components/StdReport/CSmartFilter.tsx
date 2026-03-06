/**
 * @file 10_Frontend/components/sap/ui/Common/Structures/CSmartFilter.tsx
 * 
 * @summary Core frontend CSmartFilter module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 * 
 * @description
 * This file is responsible for:
 *  - Implementing CSmartFilter functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 * 
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CSmartFilter
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
 * SECTION 1: CSmartFilter Core Logic
 * Section overview and description.
 * --------------------------
 */

'use client';

/**
 * CSmartFilter.tsx
 * 
 * A comprehensive filter component with:
 * - Collapsible filter fields
 * - Variant management (save/load filter presets)
 * - Advanced operators (contains, equals, range, etc.)
 * - Adaptive inputs (text, number, date range)
 */

import { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Grid, 
    TextField, 
    InputAdornment, 
    IconButton, 
    Button,
    Collapse, 
    Menu, 
    MenuItem, 
    Checkbox, 
    ListItemText, 
    Divider,
    Tooltip,
    Popover,
    ListSubheader
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { CVariantManagement, type VariantMetadata } from './Components/CVariantManagement';
import { CVariantManager, type IVariantService } from './CVariantManager';
import { CDateRangePicker } from '../Molecules/CDateRangePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useOrbcafeI18n } from '../../i18n';

// --- Types ---

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multi-select';

export type TextOperator = 'equals' | 'contains' | 'notContains' | 'wildcard';
export type NumberOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'between';
export type SelectOperator = 'equals' | 'anyOf';
export type DateOperator = 'between';

export type FilterOperator = TextOperator | NumberOperator | SelectOperator | DateOperator;

export interface FilterValue {
    value: any;
    operator: FilterOperator;
}

export interface FilterField {
    id: string;
    label: string;
    type?: FilterType;
    placeholder?: string;
    hidden?: boolean;
    hasSearchIcon?: boolean;
    options?: { label: string; value: any }[]; // For select type
}

export interface CSmartFilterProps {
    fields: FilterField[];
    filters: Record<string, FilterValue>;
    onFilterChange: (newFilters: Record<string, FilterValue>) => void;
    
    // Variant Props
    variants?: VariantMetadata[];
    currentVariantId?: string;
    onVariantLoad: (variant: VariantMetadata) => void;
    onVariantSave?: (metadata: Omit<VariantMetadata, 'id' | 'createdAt'>) => void;
    onVariantDelete?: (id: string) => void;
    onVariantSetDefault?: (id: string) => void;
    onSearch?: () => void;
    loading?: boolean;

    // Managed Variant Props
    appId: string; // Required for Variant Management
    tableKey?: string;
    currentLayout?: any;
    currentLayoutId?: string;
    layoutRefs?: Array<{ tableKey: string; layoutId: string | null }>;
    variantService?: IVariantService;
    serviceUrl?: string;
}

// --- Operator Config ---

const OPERATOR_LABELS: Record<string, string> = {
    // Text
    'equals': '=',
    'contains': '⊇',
    'notContains': '⊅',
    'wildcard': '*',
    // Number
    '=': '=',
    '!=': '!=',
    '>': '>',
    '<': '<',
    '>=': '≥',
    '<=': '≤',
    'between': '↔',
    // Date
    // 'between' is shared
};

const OPERATOR_TOOLTIP_KEYS: Record<string, string> = {
    'equals': 'smartFilter.operator.equals',
    'contains': 'smartFilter.operator.contains',
    'notContains': 'smartFilter.operator.notContains',
    'wildcard': 'smartFilter.operator.wildcard',
    '=': 'smartFilter.operator.equals',
    '!=': 'smartFilter.operator.notEquals',
    '>': 'smartFilter.operator.greaterThan',
    '<': 'smartFilter.operator.lessThan',
    '>=': 'smartFilter.operator.greaterOrEqual',
    '<=': 'smartFilter.operator.lessOrEqual',
    'between': 'smartFilter.operator.between',
};

const TEXT_OPERATORS: TextOperator[] = ['equals', 'contains', 'notContains', 'wildcard'];
const NUMBER_OPERATORS: NumberOperator[] = ['=', '!=', '>', '<', '>=', '<=', 'between'];

// --- Helper Component: FilterInput ---

const FONT_SIZE_SMALL = '0.85rem';

const FilterInput = ({ 
    field, 
    value, 
    onChange 
}: { 
    field: FilterField; 
    value: FilterValue; 
    onChange: (val: FilterValue) => void; 
}) => {
    const { t } = useOrbcafeI18n();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [rangeAnchorEl, setRangeAnchorEl] = useState<null | HTMLElement>(null); // For number between
    
    // Temporary state for number range inputs
    const [minVal, setMinVal] = useState('');
    const [maxVal, setMaxVal] = useState('');

    // Manage focus state to control startAdornment visibility
    const [focused, setFocused] = useState(false);

    // Search text state for multi-select
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');

    // Debounce search text
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
    }, [searchText]);

    // Initialize operator if missing (default to equals or =)
    const currentOperator = value?.operator || (field.type === 'number' ? '=' : 'equals');
    const currentValue = value?.value;

    const getTooltip = (op: string) => {
        const key = OPERATOR_TOOLTIP_KEYS[op];
        return key ? t(key as any) : op;
    };

    const handleOperatorClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOperatorSelect = (op: FilterOperator) => {
        onChange({ ...value, operator: op, value: currentValue }); // Preserve value when switching op?
        setAnchorEl(null);
    };

    // Shared props for consistent styling
    const commonTextFieldProps = {
        size: "small" as const,
        fullWidth: true,
        variant: "outlined" as const,
        InputLabelProps: { sx: { fontSize: FONT_SIZE_SMALL } },
        InputProps: { sx: { fontSize: FONT_SIZE_SMALL } },
        SelectProps: {
            MenuProps: {
                PaperProps: {
                    sx: {
                        '& .MuiMenuItem-root': {
                            fontSize: FONT_SIZE_SMALL,
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            minHeight: 'auto'
                        }
                    }
                }
            }
        }
    };

    // Render Logic based on Type
    const type = field.type || 'text';

    // 1. Date Type -> Use CDateRangePicker
    if (type === 'date') {
        // Ensure values are [Dayjs | null, Dayjs | null]
        const toDayjsRange = (v: any): [Dayjs | null, Dayjs | null] => {
             if (!v) return [null, null];
             if (Array.isArray(v) && v.length === 2) {
                 const start = v[0] ? (dayjs.isDayjs(v[0]) ? v[0] : dayjs(v[0])) : null;
                 const end = v[1] ? (dayjs.isDayjs(v[1]) ? v[1] : dayjs(v[1])) : null;
                 return [start, end];
             }
             if (dayjs.isDayjs(v) || typeof v === 'string') {
                 const d = dayjs.isDayjs(v) ? v : dayjs(v);
                 return [d, null];
             }
             return [null, null];
        };

        const dateValue = toDayjsRange(currentValue);

        return (
            <CDateRangePicker
                label={field.label}
                value={dateValue}
                onChange={(newValue) => onChange({ value: newValue, operator: 'between' })}
                // Need to pass styles to CDateRangePicker if it supports it, or wrap it
            />
        );
    }

    // 2. Number Between -> Special UI
    if (type === 'number' && currentOperator === 'between') {
        const handleRangeConfirm = () => {
            onChange({ value: [minVal, maxVal], operator: 'between' });
            setRangeAnchorEl(null);
        };

        const displayValue = Array.isArray(currentValue) 
            ? `${currentValue[0] || ''} - ${currentValue[1] || ''}`
            : '';

        return (
            <>
                <TextField
                    {...commonTextFieldProps}
                    label={field.label}
                    value={displayValue}
                    placeholder={t('smartFilter.minMaxPlaceholder')}
                    InputProps={{
                        ...commonTextFieldProps.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Tooltip title={getTooltip('between')}>
                                    <IconButton 
                                        size="small" 
                                        onClick={handleOperatorClick}
                                        sx={{ width: 24, height: 24, fontSize: FONT_SIZE_SMALL }}
                                    >
                                        {OPERATOR_LABELS['between']}
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                        readOnly: true,
                    }}
                    onClick={(e: React.MouseEvent<HTMLElement>) => setRangeAnchorEl(e.currentTarget)}
                />
                
                {/* Operator Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { '& .MuiMenuItem-root': { fontSize: FONT_SIZE_SMALL, minHeight: 'auto', py: 0.5 } } }}
                >
                    {NUMBER_OPERATORS.map(op => (
                        <MenuItem 
                            key={op} 
                            selected={op === currentOperator}
                            onClick={() => handleOperatorSelect(op)}
                        >
                            <Box sx={{ width: 24, display: 'inline-block', fontWeight: 'bold' }}>{OPERATOR_LABELS[op]}</Box>
                            <ListItemText primary={getTooltip(op)} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                        </MenuItem>
                    ))}
                </Menu>

                {/* Range Popover */}
                <Popover
                    open={Boolean(rangeAnchorEl)}
                    anchorEl={rangeAnchorEl}
                    onClose={() => setRangeAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField 
                            size="small" 
                            label={t('smartFilter.min')} 
                            type="number"
                            value={minVal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinVal(e.target.value)}
                            sx={{ width: 100 }}
                            InputLabelProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                            InputProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                        />
                        <ArrowRightAltIcon color="action" />
                        <TextField 
                            size="small" 
                            label={t('smartFilter.max')} 
                            type="number"
                            value={maxVal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxVal(e.target.value)}
                            sx={{ width: 100 }}
                            InputLabelProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                            InputProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                        />
                        <Button variant="contained" size="small" onClick={handleRangeConfirm}>{t('common.ok')}</Button>
                    </Box>
                </Popover>
            </>
        );
    }

    // 3. Select Input
    if (type === 'select') {
        return (
            <TextField
                {...commonTextFieldProps}
                select
                label={field.label}
                value={currentValue || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, value: e.target.value, operator: 'equals' })}
            >
                <MenuItem value="">
                    <em>{t('common.none')}</em>
                </MenuItem>
                {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
        );
    }

    // 4. Multi-Select Input
    if (type === 'multi-select') {
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        
        // Filter options based on debounced search text
        const filteredOptions = field.options?.filter(option => 
            option.label.toLowerCase().includes(debouncedSearchText.toLowerCase())
        ) || [];

        return (
            <TextField
                {...commonTextFieldProps}
                select
                label={field.label}
                value={selectedValues}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, value: e.target.value, operator: 'anyOf' })}
                SelectProps={{
                    ...commonTextFieldProps.SelectProps,
                    multiple: true,
                    onClose: () => {
                        setSearchText('');
                        setDebouncedSearchText('');
                    }, // Clear search on close
                    renderValue: (selected: any) => {
                         if (!Array.isArray(selected) || selected.length === 0) return <em>{t('common.none')}</em>;
                         // Map values back to labels if possible
                         const getLabel = (val: any) => field.options?.find(o => o.value === val)?.label || val;
                         // Truncate if too long
                         const labels = (selected as string[]).map(getLabel);
                         if (labels.length > 2) {
                             return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
                         }
                         return labels.join(', ');
                    }
                }}
            >
                <ListSubheader>
                    <TextField
                        size="small"
                        autoFocus
                        placeholder={t('smartFilter.searchPlaceholder')}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { fontSize: FONT_SIZE_SMALL }
                        }}
                        value={searchText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key !== 'Escape') {
                                e.stopPropagation();
                            }
                        }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                </ListSubheader>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={selectedValues.indexOf(option.value) > -1} size="small" />
                            <ListItemText primary={option.label} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <ListItemText primary={t('smartFilter.noOptionsFound')} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                    </MenuItem>
                )}
            </TextField>
        );
    }

    // 5. Standard Text/Number Input
    const operators = type === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS;
    
    const showAdornment = focused || (currentValue !== undefined && currentValue !== '' && currentValue !== null) || Boolean(anchorEl);

    return (
        <>
             <TextField 
                {...commonTextFieldProps}
                label={field.label}
                sx={{ minWidth: '120px' }}
                value={currentValue || ''}
                type={type === 'number' ? 'number' : 'text'}
                onChange={(e) => onChange({ ...value, value: e.target.value, operator: currentOperator })}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                InputProps={{
                    ...commonTextFieldProps.InputProps,
                    startAdornment: showAdornment ? (
                        <InputAdornment position="start">
                            <Tooltip title={getTooltip(currentOperator)}>
                                <IconButton 
                                    size="small"
                                    onClick={handleOperatorClick}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent blur
                                    sx={{ 
                                        width: 24, 
                                        height: 24, 
                                        fontSize: FONT_SIZE_SMALL, 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        bgcolor: 'action.hover'
                                    }}
                                >
                                    {OPERATOR_LABELS[currentOperator]}
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ) : null,
                    endAdornment: (field.hasSearchIcon) ? (
                        <InputAdornment position="end">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ) : undefined
                }}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { '& .MuiMenuItem-root': { fontSize: FONT_SIZE_SMALL, minHeight: 'auto', py: 0.5 } } }}
            >
                {operators.map(op => (
                    <MenuItem 
                        key={op} 
                        selected={op === currentOperator}
                        onClick={() => handleOperatorSelect(op)}
                    >
                        <Box sx={{ width: 24, display: 'inline-block', fontWeight: 'bold' }}>{OPERATOR_LABELS[op]}</Box>
                        <ListItemText primary={getTooltip(op)} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};


/**
 * CSmartFilter Component
 * 
 * Renders a filter bar with "Go" button, variant management, and "Adapt Filters" capability.
 */
export const CSmartFilter = ({
    fields,
    filters,
    onFilterChange,
    variants = [],
    currentVariantId,
    onVariantLoad,
    onVariantSave,
    onVariantDelete,
    onVariantSetDefault,
    onSearch,
    loading = false,
    appId,
    tableKey,
    currentLayout,
    currentLayoutId,
    layoutRefs,
    variantService,
    serviceUrl
}: CSmartFilterProps) => {
    const { t } = useOrbcafeI18n();
    // State
    const [isExpanded, setIsExpanded] = useState(true);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
    const [visibleFields, setVisibleFields] = useState<string[]>(
        fields.filter(f => !f.hidden).map(f => f.id)
    );

    // Handlers
    const handleFilterChange = (id: string, val: FilterValue) => {
        onFilterChange({
            ...filters,
            [id]: val
        });
    };

    const toggleFieldVisibility = (fieldId: string) => {
        if (visibleFields.includes(fieldId)) {
            setVisibleFields(visibleFields.filter(id => id !== fieldId));
        } else {
            setVisibleFields([...visibleFields, fieldId]);
        }
    };

    // Internal Variant Load Handler
    const handleInternalVariantLoad = (variant: VariantMetadata) => {
        if (!variant.filters) return;

        let scopedData: any = null;

        // 1. Extract data for current scope (tableKey)
        if (Array.isArray(variant.filters)) {
            const scope = tableKey || 'default';
            const entry = variant.filters.find((f: any) => f.scope === scope);
            scopedData = entry ? entry.filters : null;
        } else {
            // Legacy structure
            scopedData = variant.filters;
        }

        if (scopedData) {
            // 2. Check for { values, visibleFields } structure
            if (scopedData.values || scopedData.visibleFields) {
                if (scopedData.visibleFields && Array.isArray(scopedData.visibleFields)) {
                    setVisibleFields(scopedData.visibleFields);
                }
                if (scopedData.values) {
                    onFilterChange(scopedData.values);
                }
            } else {
                // Legacy: scopedData IS the filters object
                onFilterChange(scopedData);
            }
        }

        // 3. Propagate to parent
        if (onVariantLoad) {
            onVariantLoad(variant);
        }
    };

    return (
        <Paper sx={{ mb: 0, display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}>
            {/* Header: Variants + Settings */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {appId ? (
                    <CVariantManager
                        appId={appId}
                        tableKey={tableKey}
                        currentFilters={{ values: filters, visibleFields }}
                        currentLayout={currentLayout}
                        currentLayoutId={currentLayoutId}
                        layoutRefs={layoutRefs}
                        onLoad={handleInternalVariantLoad}
                        variantService={variantService}
                        serviceUrl={serviceUrl}
                        currentVariantId={currentVariantId}
                    />
                ) : (
                    <CVariantManagement 
                        variants={variants}
                        currentVariantId={currentVariantId}
                        onLoad={onVariantLoad}
                        onSave={(meta) => {
                            if (onVariantSave) {
                                onVariantSave({
                                    ...meta,
                                    filters: {
                                        values: filters,
                                        visibleFields
                                    }
                                });
                            }
                        }}
                        onDelete={onVariantDelete!}
                        onSetDefault={onVariantSetDefault!}
                    />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Add Filter Button */}
                    <Tooltip title={t('smartFilter.addFilters')}>
                        <Button 
                            onClick={(e) => setSettingsAnchorEl(e.currentTarget)} 
                            size="small" 
                            color="primary"
                            startIcon={<SettingsIcon fontSize="small" />}
                            sx={{
                                textTransform: 'none',
                                fontSize: FONT_SIZE_SMALL,
                                whiteSpace: 'nowrap',
                                minWidth: 'fit-content',
                            }}
                        >
                            {t('smartFilter.adaptFilters')}
                        </Button>
                    </Tooltip>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={onSearch}
                        disabled={loading}
                        sx={{ minWidth: '40px', fontWeight: 'bold', fontSize: FONT_SIZE_SMALL }}
                    >
                        {loading ? t('common.loading') : t('smartFilter.go')}
                    </Button>
                    <Menu
                        anchorEl={settingsAnchorEl}
                        open={Boolean(settingsAnchorEl)}
                        onClose={() => setSettingsAnchorEl(null)}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: 400,
                                    width: '25ch',
                                },
                                sx: {
                                    '& .MuiMenuItem-root': {
                                        fontSize: FONT_SIZE_SMALL,
                                        minHeight: 32,
                                    },
                                },
                            }
                        }}
                    >
                        <MenuItem disabled>
                            <ListItemText primary={t('smartFilter.visibleFilters')} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                        </MenuItem>
                        <Divider />
                        {fields.map(field => (
                            <MenuItem key={field.id} onClick={() => toggleFieldVisibility(field.id)}>
                                <Checkbox checked={visibleFields.includes(field.id)} size="small" />
                                <ListItemText primary={field.label} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Box>

            {/* Filter Grid */}
            <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                    <Grid container spacing={2} columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}>
                        {fields.filter(f => visibleFields.includes(f.id)).map(field => (
                            <Grid key={field.id} size={1}>
                                <FilterInput 
                                    field={field}
                                    value={filters[field.id] || { value: '', operator: field.type === 'number' ? '=' : 'equals' }}
                                    onChange={(val) => handleFilterChange(field.id, val)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Collapse>

            {/* Expand/Collapse Handle */}
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: '50%', 
                    transform: 'translate(-50%, 50%)',
                    zIndex: 10
                }}
            >
                <IconButton 
                    size="small"
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{ 
                        bgcolor: 'background.paper', 
                        boxShadow: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        width: 20,
                        height: 20,
                        minHeight: 0,
                        p: 0,
                        '&:hover': { bgcolor: 'background.paper' } 
                    }}
                >
                    {isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: 16 }} color="action" /> : <KeyboardArrowDownIcon sx={{ fontSize: 16 }} color="action" />}
                </IconButton>
            </Box>
        </Paper>
    );
};
