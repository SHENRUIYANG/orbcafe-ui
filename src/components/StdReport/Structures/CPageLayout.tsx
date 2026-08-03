import React from 'react';
import {  CTypography } from "../../Atoms";

export interface CPageLayoutProps {
    title: string;
    hideHeader?: boolean;
    children?: React.ReactNode;
}

export const CPageLayout = ({ title, hideHeader, children }: CPageLayoutProps) => {
    return (
        <div sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {!hideHeader && (
                <div sx={{ mb: 2 }}>
                    <CTypography variant="h4">{title}</CTypography>
                </div>
            )}
            <div sx={{ flex: 1, overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    );
};