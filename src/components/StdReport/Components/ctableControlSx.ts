export const TABLE_CONTROL_COLUMN_WIDTH = 56;
export const TABLE_GROUP_CONTROL_COLUMN_WIDTH = 72;
export const TABLE_CONTROL_BUTTON_SIZE = 30;
export const TABLE_CONTROL_ICON_SIZE = 20;

export const tableSelectionCellSx = {
    width: TABLE_CONTROL_COLUMN_WIDTH,
    minWidth: TABLE_CONTROL_COLUMN_WIDTH,
    maxWidth: TABLE_CONTROL_COLUMN_WIDTH,
    paddingLeft: '4px !important',
    paddingRight: '4px !important',
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    textAlign: 'center',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
} as const;

export const tableGroupControlCellSx = {
    width: TABLE_GROUP_CONTROL_COLUMN_WIDTH,
    minWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH,
    maxWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH,
    paddingLeft: '4px !important',
    paddingRight: '4px !important',
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    textAlign: 'center',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
} as const;

export const tableControlCheckboxSx = {
    width: TABLE_CONTROL_BUTTON_SIZE,
    height: TABLE_CONTROL_BUTTON_SIZE,
    p: 0.25,
    flex: '0 0 auto',
    '& svg': {
        fontSize: TABLE_CONTROL_ICON_SIZE,
    },
} as const;

export const tableControlIconButtonSx = {
    width: TABLE_CONTROL_BUTTON_SIZE,
    height: TABLE_CONTROL_BUTTON_SIZE,
    minWidth: TABLE_CONTROL_BUTTON_SIZE,
    minHeight: TABLE_CONTROL_BUTTON_SIZE,
    p: 0.25,
    flex: '0 0 auto',
    '& svg': {
        fontSize: TABLE_CONTROL_ICON_SIZE,
    },
} as const;

export const tableGroupControlsSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    width: '100%',
    minWidth: 0,
} as const;

export const tableToolbarIconButtonSx = {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    p: 0,
    flex: '0 0 auto',
    borderRadius: 1,
    color: 'text.secondary',
    '& svg, & [data-sap-icon]': {
        width: 16,
        height: 16,
        fontSize: 16,
        strokeWidth: 1.8,
    },
} as const;
