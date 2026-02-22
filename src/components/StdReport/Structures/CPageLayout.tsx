import React from 'react';
import { Box, Typography } from '@mui/material';

export interface CPageLayoutProps {
    title: string;
    hideHeader?: boolean;
    children?: React.ReactNode;
}

export const CPageLayout = ({ title, hideHeader, children }: CPageLayoutProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {!hideHeader && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h4">{title}</Typography>
                </Box>
            )}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {children}
            </Box>
        </Box>
    );
};