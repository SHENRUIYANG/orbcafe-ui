import { ArrowRightAltIcon, CCheckbox, CDivider, CListItemText, Grid, InputAdornment, KeyboardArrowDownIcon, KeyboardArrowUpIcon, Popover, SearchIcon, SettingsIcon } from '../../lib/orbis-compat';
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
import { CButton, CIconButton, CSelect, CSpinner, CTextField, CTooltip, CMenu, CPaper } from "../Atoms";
import { SapIcon } from '../Icons';
import { CVariantManagement, type VariantMetadata } from './Components/CVariantManagement';
import { CVariantManager, type IVariantService } from './CVariantManager';
import { CDateRangePicker } from '../Molecules/CDateRangePicker';
import { CValueHelp } from '../Molecules/CValueHelp';
import type { CValueHelpProps, CValueHelpRecord } from '../Molecules/CValueHelp';
import dayjs, { type Dayjs } from 'dayjs';
import { useOrbcafeI18n } from '../../i18n';
import { TABLE_CONTROL_BUTTON_SIZE, TABLE_CONTROL_ICON_SIZE } from './Components/ctableControlSx';

// --- Types ---

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'value-help';

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
    isValueHelp?: boolean;
    valueHelp?: Omit<CValueHelpProps<CValueHelpRecord>, 'label' | 'onChange' | 'value'>;
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

const TEXT_OPERATORS: FilterOperator[] = ['contains', 'notContains', '>', '>=', '<', '<=', 'equals'];
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
    const [multiSelectAnchorEl, setMultiSelectAnchorEl] = useState<null | HTMLElement>(null);

    // Temporary state for number range inputs
    const [minVal, setMinVal] = useState('');
    const [maxVal, setMaxVal] = useState('');

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
        setAnchorEl(anchorEl ? null : event.currentTarget);
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
                        '& .orb-menu-item, & option': {
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
                <CTextField
                    {...commonTextFieldProps}
                    label={field.label}
                    value={displayValue}
                    placeholder={t('smartFilter.minMaxPlaceholder')}
                    InputProps={{
                        ...commonTextFieldProps.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <CTooltip title={getTooltip('between')}>
                                    <CIconButton
                                        size="small"
                                        onClick={handleOperatorClick}
                                        sx={{ width: 24, height: 24, fontSize: FONT_SIZE_SMALL }}
                                    >
                                        {OPERATOR_LABELS['between']}
                                    </CIconButton>
                                </CTooltip>
                            </InputAdornment>
                        ),
                        readOnly: true,
                    }}
                    onClick={(e: React.MouseEvent<HTMLElement>) => setRangeAnchorEl(rangeAnchorEl ? null : e.currentTarget)}
                />

                {/* Operator Menu */}
                <CMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { '& .orb-menu-item, & option': { fontSize: FONT_SIZE_SMALL, minHeight: 'auto', py: 0.5 } } }}
                >
                    {NUMBER_OPERATORS.map(op => (
                        <option
                            key={op}
                            selected={op === currentOperator}
                            onClick={() => handleOperatorSelect(op)}
                        >
                            <div sx={{ width: 24, display: 'inline-block', fontWeight: 'bold' }}>{OPERATOR_LABELS[op]}</div>
                            <CListItemText primary={getTooltip(op)} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                        </option>
                    ))}
                </CMenu>

                {/* Range Popover */}
                <Popover
                    open={Boolean(rangeAnchorEl)}
                    anchorEl={rangeAnchorEl}
                    onClose={() => setRangeAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <div sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <CTextField
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
                        <CTextField
                            size="small"
                            label={t('smartFilter.max')}
                            type="number"
                            value={maxVal}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxVal(e.target.value)}
                            sx={{ width: 100 }}
                            InputLabelProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                            InputProps={{ sx: { fontSize: FONT_SIZE_SMALL } }}
                        />
                        <CButton variant="contained" size="small" onClick={handleRangeConfirm}>{t('common.ok')}</CButton>
                    </div>
                </Popover>
            </>
        );
    }

    // 3. Value Help Input
    if (field.isValueHelp || type === 'value-help') {
        const valueHelpMode = field.valueHelp?.mode || 'single';

        return (
            <CValueHelp
                {...commonTextFieldProps}
                {...field.valueHelp}
                label={field.label}
                placeholder={field.placeholder || field.valueHelp?.placeholder}
                value={currentValue ?? (valueHelpMode === 'multiple' ? [] : null)}
                mode={valueHelpMode}
                onChange={(newValue) => onChange({
                    value: newValue,
                    operator: valueHelpMode === 'multiple' ? 'anyOf' : 'equals'
                })}
            />
        );
    }

    // 4. Select Input
    if (type === 'select') {
        return (
            <CSelect
                size="small"
                fullWidth
                label={field.label}
                value={currentValue || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, value: e.target.value, operator: 'equals' })}
            >
                <option value="">
                    {t('common.none')}
                </option>
                {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </CSelect>
        );
    }

    // 5. Multi-Select Input
    if (type === 'multi-select') {
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];

        // Filter options based on debounced search text
        const filteredOptions = field.options?.filter(option =>
            option.label.toLowerCase().includes(debouncedSearchText.toLowerCase())
        ) || [];

        const getLabel = (optionValue: any) => field.options?.find((option) => option.value === optionValue)?.label || optionValue;
        const selectedLabels = selectedValues.map(getLabel);
        const displayValue = selectedLabels.length === 0
            ? t('common.none')
            : selectedLabels.length > 2
                ? `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`
                : selectedLabels.join(', ');
        const closeMultiSelect = () => {
            setMultiSelectAnchorEl(null);
            setSearchText('');
            setDebouncedSearchText('');
        };
        const toggleValue = (optionValue: any) => {
            const nextValues = selectedValues.includes(optionValue)
                ? selectedValues.filter((selectedValue) => selectedValue !== optionValue)
                : [...selectedValues, optionValue];
            onChange({ ...value, value: nextValues, operator: 'anyOf' });
        };

        return (
            <div className="orb-fld">
                <label>{field.label}</label>
                <CButton
                    variant="outlined"
                    size="small"
                    onClick={(event) => setMultiSelectAnchorEl(multiSelectAnchorEl ? null : event.currentTarget)}
                    sx={{ width: '100%', minHeight: 36, justifyContent: 'space-between', fontSize: FONT_SIZE_SMALL, fontWeight: 400 }}
                >
                    <span sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayValue}</span>
                    <KeyboardArrowDownIcon fontSize="small" />
                </CButton>
                <CMenu
                    anchorEl={multiSelectAnchorEl}
                    open={Boolean(multiSelectAnchorEl)}
                    onClose={closeMultiSelect}
                    PaperProps={{ sx: { width: 280, maxHeight: 340, overflowY: 'auto', p: 0.5 } }}
                >
                    <div onClick={(event) => event.stopPropagation()} sx={{ display: 'grid', gap: 0.35 }}>
                        <CTextField
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
                            onChange={(event) => setSearchText(event.target.value)}
                            onKeyDown={(event) => event.stopPropagation()}
                        />
                        {filteredOptions.length > 0 ? filteredOptions.map((option) => {
                            const checked = selectedValues.includes(option.value);
                            return (
                                <div
                                    key={String(option.value)}
                                    role="option"
                                    aria-selected={checked}
                                    tabIndex={0}
                                    className={`orb-menu-item ${checked ? 'orb-selected' : ''}`}
                                    onClick={() => toggleValue(option.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            toggleValue(option.value);
                                        }
                                    }}
                                >
                                    <CCheckbox checked={checked} size="small" inputProps={{ tabIndex: -1 }} sx={{ pointerEvents: 'none' }} />
                                    <CListItemText primary={option.label} />
                                </div>
                            );
                        }) : (
                            <div className="orb-menu-item" aria-disabled="true">{t('smartFilter.noOptionsFound')}</div>
                        )}
                    </div>
                </CMenu>
            </div>
        );
    }

    // 6. Standard Text/Number Input
    const operators = type === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS;

    const showAdornment = true;

    return (
        <>
             <CTextField
                {...commonTextFieldProps}
                className="orb-filter-operator-field"
                label={field.label}
                sx={{ minWidth: '120px' }}
                value={currentValue || ''}
                type={type === 'number' ? 'number' : 'text'}
                onChange={(e) => onChange({ ...value, value: e.target.value, operator: currentOperator })}
                InputProps={{
                    ...commonTextFieldProps.InputProps,
                    startAdornment: showAdornment ? (
                        <InputAdornment position="start">
                            <CTooltip title={getTooltip(currentOperator)}>
                                <CIconButton
                                    className="orb-filter-operator-trigger"
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
                                </CIconButton>
                            </CTooltip>
                        </InputAdornment>
                    ) : null,
                    endAdornment: (field.hasSearchIcon) ? (
                        <InputAdornment position="end">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ) : undefined
                }}
            />
            <CMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { '& .orb-menu-item, & option': { fontSize: FONT_SIZE_SMALL, minHeight: 'auto', py: 0.5 } } }}
            >
                {operators.map(op => (
                    <option
                        key={op}
                        selected={op === currentOperator}
                        onClick={() => handleOperatorSelect(op)}
                    >
                        <span className="orb-filter-operator-symbol">{OPERATOR_LABELS[op]}</span>
                        <CListItemText primary={getTooltip(op)} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                    </option>
                ))}
            </CMenu>
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
        <CPaper
            className={`orb-smart-filter ${isExpanded ? 'orb-smart-filter-expanded' : 'orb-smart-filter-collapsed'}`}
            sx={{ mb: 0, display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}
        >
            {isExpanded ? <>
            {/* Header: Variants + Settings */}
            <div className="orb-smart-filter-header">
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
                <div className="orb-smart-filter-actions">
                    {/* Add Filter Button */}
                    <CTooltip title={t('smartFilter.addFilters')}>
                        <CButton
                            className="orb-smart-filter-adapt"
                            onClick={(e) => setSettingsAnchorEl(settingsAnchorEl ? null : e.currentTarget)}
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
                        </CButton>
                    </CTooltip>
                    <CIconButton
                        className="orb-smart-filter-go"
                        tooltip={t('smartFilter.go')}
                        aria-label={t('smartFilter.go')}
                        onClick={onSearch}
                        disabled={loading}
                    >
                        {loading ? <CSpinner size={16} /> : <SapIcon name="play" size={16} />}
                    </CIconButton>
                    <CMenu
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
                                    '& .orb-menu-item, & option': {
                                        fontSize: FONT_SIZE_SMALL,
                                        minHeight: 32,
                                    },
                                },
                            }
                        }}
                    >
                        <option disabled>
                            <CListItemText primary={t('smartFilter.visibleFilters')} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                        </option>
                        <CDivider />
                        {fields.map(field => (
                            <option key={field.id} onClick={() => toggleFieldVisibility(field.id)}>
                                <CCheckbox checked={visibleFields.includes(field.id)} size="small" />
                                <CListItemText primary={field.label} primaryTypographyProps={{ fontSize: FONT_SIZE_SMALL }} />
                            </option>
                        ))}
                    </CMenu>
                </div>
            </div>

            {/* Filter Grid */}
                <div className="orb-smart-filter-grid">
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
                </div>
            </> : null}

            {/* Expand/Collapse Handle */}
            <div className="orb-smart-filter-toggle">
                <CIconButton
                    className="orb-smart-filter-toggle-button"
                    size="small"
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        width: TABLE_CONTROL_BUTTON_SIZE,
                        height: TABLE_CONTROL_BUTTON_SIZE,
                        minWidth: TABLE_CONTROL_BUTTON_SIZE,
                        minHeight: 0,
                        p: 0,
                        '&:hover': { bgcolor: 'background.paper' }
                    }}
                >
                    {isExpanded ? <KeyboardArrowUpIcon className="orb-smart-filter-toggle-icon" sx={{ fontSize: TABLE_CONTROL_ICON_SIZE }} color="action" /> : <KeyboardArrowDownIcon className="orb-smart-filter-toggle-icon" sx={{ fontSize: TABLE_CONTROL_ICON_SIZE }} color="action" />}
                </CIconButton>
            </div>
        </CPaper>
    );
};
