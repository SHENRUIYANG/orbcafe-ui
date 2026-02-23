import React from 'react';
import { Toolbar, IconButton, Tooltip, TextField, Box, Badge, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FunctionsIcon from '@mui/icons-material/Functions';
import InsightsIcon from '@mui/icons-material/Insights';

export const CTableToolbar = (props: any) => {
    const FONT_SIZE_SMALL = '0.75rem';
    const actionNodes = Array.isArray(props.actions) ? props.actions : props.actions ? [props.actions] : [];
    const extraToolNodes = Array.isArray(props.extraTools) ? props.extraTools : props.extraTools ? [props.extraTools] : [];
    const customToolNodes = [...actionNodes, ...extraToolNodes];

    return (
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, alignItems: 'center', gap: 1 }}>
            <TextField
                size="small"
                placeholder="Search..."
                value={props.filterText}
                onChange={(e) => props.setFilterText(e.target.value)}
                InputProps={{
                    sx: {
                        fontSize: FONT_SIZE_SMALL,
                        '& .MuiInputBase-input': {
                            fontSize: FONT_SIZE_SMALL,
                        },
                        '& .MuiInputBase-input::placeholder': {
                            fontSize: FONT_SIZE_SMALL,
                            opacity: 1,
                        },
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ width: 300 }}
            />

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box
                    sx={{
                        width: 1,
                        height: 20,
                        bgcolor: 'divider',
                        mr: 0.5,
                    }}
                />

                {/* Grouping */}
                <Tooltip title="Group By">
                    <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.setGroupAnchorEl(e.currentTarget)}>
                        <Badge badgeContent={props.grouping?.length} color="primary">
                            <AccountTreeIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Summary */}
                <Tooltip title="Summary">
                    <IconButton 
                        onClick={(e: React.MouseEvent<HTMLElement>) => props.setSummaryAnchorEl(e.currentTarget)}
                        color={props.showSummary ? 'primary' : 'default'}
                    >
                        <FunctionsIcon />
                    </IconButton>
                </Tooltip>

                {/* Columns */}
                <Tooltip title="Columns">
                    <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.setAnchorEl(e.currentTarget)}>
                        <ViewColumnIcon />
                    </IconButton>
                </Tooltip>

                {/* Export */}
                <Tooltip title="Export">
                    <IconButton onClick={props.handleExport}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>

                {/* Layout Save */}
                {/* 
                  Only show the standalone Save button if NO layout manager is provided.
                  If layoutManager is provided, it handles the UI (including Save Dialog).
                */}
                {props.onOpenGraphReport && (
                    <Tooltip title="Graphic Report">
                        <IconButton onClick={props.onOpenGraphReport}>
                            <InsightsIcon />

                        </IconButton>
                    </Tooltip>
                )}

                {props.onLayoutSave && !props.layoutManager && (
                    <Tooltip title="Save Layout">
                        <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.onLayoutSave(e)}>
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                )}
                
                {/* Hidden Layout Manager for persistence logic */}
                {props.layoutManager}

                {customToolNodes.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {customToolNodes.map((node: React.ReactNode, idx: number) => (
                            <React.Fragment key={`toolbar-custom-${idx}`}>{node}</React.Fragment>
                        ))}
                    </Box>
                )}
            </Box>
        </Toolbar>
    );
};
