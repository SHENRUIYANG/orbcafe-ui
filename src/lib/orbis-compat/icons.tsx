'use client';

import type { CSSProperties } from 'react';
import { SapIcon } from '../../components/Icons';
import type { SapIconName } from '../../components/Icons';

import { resolveOrbSx } from './sx';
import type { OrbSxProps } from './sx';

export interface OrbIconProps {
  size?: number | string;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large' | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
  sx?: OrbSxProps;
  titleAccess?: string;
  'aria-label'?: string;
}

const iconSize = (fontSize: OrbIconProps['fontSize'], size: OrbIconProps['size']): number | string => {
  if (size !== undefined) return size;
  if (typeof fontSize === 'number') return fontSize;
  if (fontSize === 'small') return 18;
  if (fontSize === 'large') return 30;
  if (fontSize === 'inherit') return '1em';
  return 22;
};

const adapt = (name: SapIconName) => {
  const OrbIcon = ({ fontSize, size, sx, className, style, titleAccess, ...props }: OrbIconProps) => {
    const resolved = resolveOrbSx(sx, className, style);
    return (
      <SapIcon
        name={name}
        size={iconSize(fontSize, size)}
        className={resolved.className}
        style={resolved.style}
        aria-label={props['aria-label'] ?? titleAccess}
        {...props}
      />
    );
  };
  return OrbIcon;
};

export const AccountTreeIcon = adapt('tree');
export const AddIcon = adapt('add');
export const AddRoundedIcon = adapt('duplicate');
export const ArrowDownwardIcon = adapt('down');
export const ArrowDropDownIcon = adapt('slimDown');
export const ArrowForwardIcon = adapt('navigationRight');
export const ArrowRightAltIcon = adapt('navigationRight');
export const ArrowUpwardIcon = adapt('up');
export const BackspaceRoundedIcon = adapt('delete');
export const CalendarMonthIcon = adapt('calendar');
export const CameraAltRoundedIcon = adapt('camera');
export const CheckIcon = adapt('accept');
export const CheckRoundedIcon = adapt('accept');
export const ChevronRightRoundedIcon = adapt('navigationRight');
export const ClearAllIcon = adapt('dimension');
export const ClearIcon = adapt('decline');
export const Close = adapt('decline');
export const CloseIcon = adapt('decline');
export const CloseOutlinedIcon = adapt('decline');
export const CloseRoundedIcon = adapt('decline');
export const DarkModeIcon = adapt('darkMode');
export const DeleteIcon = adapt('delete');
export const DeleteOutlineIcon = adapt('delete');
export const DownloadIcon = adapt('download');
export const DragIndicatorIcon = adapt('move');
export const DragIndicatorRoundedIcon = adapt('move');
export const EditIcon = adapt('edit');
export const ExpandMoreRoundedIcon = adapt('slimDown');
export const FilterListIcon = adapt('filter');
export const FunctionsIcon = adapt('sum');
export const HardwareRoundedIcon = adapt('wrench');
export const InsightsIcon = adapt('lineChart');
export const InsertDriveFile = adapt('document');
export const KeyboardArrowDownIcon = adapt('slimDown');
export const KeyboardArrowLeftIcon = adapt('navigationLeft');
export const KeyboardArrowRightIcon = adapt('navigationRight');
export const KeyboardArrowUpIcon = adapt('slimUp');
export const KeyboardDoubleArrowLeftOutlinedIcon = adapt('navigationLeft');
export const KeyboardDoubleArrowRightOutlinedIcon = adapt('navigationRight');
export const LayersClearIcon = adapt('dimension');
export const LightModeIcon = adapt('lightMode');
export const LockResetIcon = adapt('locked');
export const LogoutIcon = adapt('log');
export const MenuOpenRoundedIcon = adapt('splitOne');
export const MenuRoundedIcon = adapt('menu');
export const MicNoneOutlinedIcon = adapt('microphone');
export const MicOffRoundedIcon = adapt('microphone');
export const MicRoundedIcon = adapt('microphone');
export const PlayArrowIcon = adapt('play');
export const QrCodeScannerRoundedIcon = adapt('qrCode');
export const SaveIcon = adapt('save');
export const SearchIcon = adapt('search');
export const SearchRoundedIcon = adapt('search');
export const SendOutlinedIcon = adapt('paperPlane');
export const SendRoundedIcon = adapt('paperPlane');
export const SettingsIcon = adapt('wrench');
export const SortIcon = adapt('sort');
export const SplitscreenOutlinedIcon = adapt('splitTwo');
export const StarBorderIcon = adapt('favorite');
export const StarIcon = adapt('favorite');
export const Stop = adapt('stop');
export const TableRowsIcon = adapt('tableRow');
export const TranslateIcon = adapt('translate');
export const UnfoldLessIcon = adapt('collapseAll');
export const UnfoldMoreIcon = adapt('expandAll');
export const ViewColumnIcon = adapt('tableColumn');
export const ViewQuiltIcon = adapt('overview');
export const VisibilityOffIcon = adapt('hide');

// Additional aliases retained for consumers that used the old icon vocabulary.
export const DesktopWindowsIcon = adapt('overview');
export const LanguageIcon = adapt('translate');
export const ColumnsIcon = adapt('tableColumn');
export const ExpandIcon = adapt('fullScreen');
