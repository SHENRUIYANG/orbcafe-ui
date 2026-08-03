import { useOrbcafeI18n } from '../../../i18n';
import {  CTypography } from "../../Atoms";

export const CTableMobile = (_props: any) => {
    const { t } = useOrbcafeI18n();
    return (
        <div sx={{ p: 2 }}>
            <CTypography>{t('table.mobile.notImplemented')}</CTypography>
        </div>
    );
};
