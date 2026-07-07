import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftOutlined';
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';
import SplitscreenOutlinedIcon from '@mui/icons-material/SplitscreenOutlined';
import type { SxProps, Theme } from '@mui/material/styles';
import { CIconButton } from '../Atoms/CIconButton';
import { CTable } from '../StdReport/CTable';
import type { CSmartFilterProps } from '../StdReport/CSmartFilter';

export type CTreeCompPaneMode = 'tree' | 'split' | 'detail';

export interface CTreeCompNode {
  id: string;
  label: string;
  subtitle?: string;
  markerColor?: string;
  children?: CTreeCompNode[];
  [key: string]: unknown;
}

export interface CTreeCompColumn<TNode extends CTreeCompNode = CTreeCompNode> {
  id: string;
  label: ReactNode;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  numeric?: boolean;
  render?: (node: TNode) => ReactNode;
}

export interface CTreeCompProps<TNode extends CTreeCompNode = CTreeCompNode> {
  title: ReactNode;
  subtitle?: ReactNode;
  nodes: TNode[];
  columns?: CTreeCompColumn<TNode>[];
  detail?: ReactNode | ((node: TNode | null) => ReactNode);
  selectedNodeId?: string | null;
  defaultSelectedNodeId?: string;
  onNodeSelect?: (node: TNode) => void;
  expandedNodeIds?: string[];
  defaultExpandedNodeIds?: string[];
  onExpandedNodeIdsChange?: (nodeIds: string[]) => void;
  defaultPaneMode?: CTreeCompPaneMode;
  minTreePaneWidth?: number;
  minDetailPaneWidth?: number;
  tableAppId?: string;
  tableKey?: string;
  tableTitle?: string;
  filterConfig?: CSmartFilterProps;
  searchQuery?: string;
  searchToken?: string | number;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  serviceUrl?: string;
  emptyLabel?: ReactNode;
  headerAction?: ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
}

type FlatTreeNode<TNode extends CTreeCompNode> = {
  node: TNode;
  level: number;
  hasChildren: boolean;
  parentIds: string[];
};

const DEFAULT_TREE_PANE_WIDTH = 640;
const MIN_TREE_PANE_WIDTH = 360;
const MIN_DETAIL_PANE_WIDTH = 360;
const SPLITTER_WIDTH = 8;
const PANE_TRANSITION = '220ms cubic-bezier(0.2, 0, 0, 1)';

const flattenVisibleNodes = <TNode extends CTreeCompNode>(
  nodes: TNode[],
  expandedIds: Set<string>,
  level = 0,
  parentIds: string[] = [],
): Array<FlatTreeNode<TNode>> =>
  nodes.flatMap((node) => {
    const children = (node.children ?? []) as TNode[];
    const current = [{ node, level, hasChildren: children.length > 0, parentIds }];
    if (!expandedIds.has(node.id)) return current;
    return [...current, ...flattenVisibleNodes(children, expandedIds, level + 1, [...parentIds, node.id])];
  });

const flattenAllNodes = <TNode extends CTreeCompNode>(nodes: TNode[]): TNode[] =>
  nodes.flatMap((node) => [node, ...flattenAllNodes((node.children ?? []) as TNode[])]);

const flattenAllNodeMeta = <TNode extends CTreeCompNode>(
  nodes: TNode[],
  level = 0,
  parentIds: string[] = [],
): Array<FlatTreeNode<TNode>> =>
  nodes.flatMap((node) => {
    const children = (node.children ?? []) as TNode[];
    return [
      { node, level, hasChildren: children.length > 0, parentIds },
      ...flattenAllNodeMeta(children, level + 1, [...parentIds, node.id]),
    ];
  });

const collectExpandableIds = <TNode extends CTreeCompNode>(nodes: TNode[]): string[] =>
  nodes.flatMap((node) => {
    const children = (node.children ?? []) as TNode[];
    if (children.length === 0) return [];
    return [node.id, ...collectExpandableIds(children)];
  });

const getNodeSearchText = (node: CTreeCompNode) =>
  Object.entries(node)
    .filter(([key]) => key !== 'children')
    .map(([, value]) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
      return '';
    })
    .join(' ')
    .toLowerCase();

export const CTreeComp = <TNode extends CTreeCompNode = CTreeCompNode>({
  title,
  subtitle,
  nodes,
  columns,
  detail,
  selectedNodeId,
  defaultSelectedNodeId,
  onNodeSelect,
  expandedNodeIds,
  defaultExpandedNodeIds,
  onExpandedNodeIdsChange,
  defaultPaneMode = 'split',
  minTreePaneWidth = MIN_TREE_PANE_WIDTH,
  minDetailPaneWidth = MIN_DETAIL_PANE_WIDTH,
  tableAppId = 'ctree-comp',
  tableKey = 'default',
  tableTitle,
  filterConfig,
  searchQuery,
  searchToken,
  defaultRowsPerPage = -1,
  rowsPerPageOptions = [20, 50, 100, -1],
  serviceUrl,
  emptyLabel = 'No tree items available.',
  headerAction,
  sx,
  className,
}: CTreeCompProps<TNode>) => {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState(defaultSelectedNodeId ?? nodes[0]?.id ?? null);
  const [internalExpandedIds, setInternalExpandedIds] = useState<string[]>(
    defaultExpandedNodeIds ?? collectExpandableIds(nodes).slice(0, 3),
  );
  const [paneMode, setPaneMode] = useState<CTreeCompPaneMode>(defaultPaneMode);
  const [treePaneWidth, setTreePaneWidth] = useState(DEFAULT_TREE_PANE_WIDTH);
  const [splitLayoutWidth, setSplitLayoutWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const resolvedColumns = useMemo<CTreeCompColumn<TNode>[]>(
    () =>
      columns && columns.length > 0
        ? columns
        : [
            {
              id: 'label',
              label: 'Name',
              render: (node) => (
                <Stack spacing={0.3}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>
                    {node.label}
                  </Typography>
                  {node.subtitle && (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.2 }}>
                      {node.subtitle}
                    </Typography>
                  )}
                </Stack>
              ),
            },
          ],
    [columns],
  );
  const expandedSet = useMemo(() => new Set(expandedNodeIds ?? internalExpandedIds), [expandedNodeIds, internalExpandedIds]);
  const flatNodes = useMemo(() => flattenVisibleNodes(nodes, expandedSet), [nodes, expandedSet]);
  const allNodes = useMemo(() => flattenAllNodes(nodes), [nodes]);
  const allNodeMeta = useMemo(() => flattenAllNodeMeta(nodes), [nodes]);
  const activeSelectedId = selectedNodeId === undefined ? internalSelectedId : selectedNodeId;
  const selectedNode = useMemo(
    () => allNodes.find((node) => node.id === activeSelectedId) ?? null,
    [activeSelectedId, allNodes],
  );
  const clampTreePaneWidth = (width: number) => {
    const layoutWidth = splitRef.current?.clientWidth ?? 0;
    const maxWidth = layoutWidth > 0
      ? Math.max(minTreePaneWidth, layoutWidth - SPLITTER_WIDTH - minDetailPaneWidth)
      : Math.max(minTreePaneWidth, width);
    return Math.min(Math.max(width, minTreePaneWidth), maxWidth);
  };
  const treeCollapsed = paneMode === 'detail';
  const detailCollapsed = paneMode === 'tree' || !detail;
  const showSplitter = paneMode === 'split' && Boolean(detail);
  const getMeasuredGridColumns = () => {
    if (splitLayoutWidth <= 0) return null;

    if (paneMode === 'tree' || !detail) {
      return {
        treeWidth: splitLayoutWidth,
        splitterWidth: 0,
        detailWidth: 0,
      };
    }

    if (paneMode === 'detail') {
      return {
        treeWidth: 0,
        splitterWidth: 0,
        detailWidth: splitLayoutWidth,
      };
    }

    const splitterWidth = showSplitter ? SPLITTER_WIDTH : 0;
    const treeWidth = clampTreePaneWidth(treePaneWidth);
    return {
      treeWidth,
      splitterWidth,
      detailWidth: Math.max(0, splitLayoutWidth - splitterWidth - treeWidth),
    };
  };
  const measuredGridColumns = getMeasuredGridColumns();
  const gridTemplateColumns = measuredGridColumns
    ? `${measuredGridColumns.treeWidth}px ${measuredGridColumns.splitterWidth}px ${measuredGridColumns.detailWidth}px`
    : paneMode === 'tree' || !detail
      ? 'minmax(0, 1fr) 0px 0px'
      : paneMode === 'detail'
        ? '0px 0px minmax(0, 1fr)'
        : `minmax(${minTreePaneWidth}px, ${treePaneWidth}px) ${SPLITTER_WIDTH}px minmax(${minDetailPaneWidth}px, 1fr)`;

  useEffect(() => {
    const layoutEl = splitRef.current;
    if (!layoutEl) {
      setSplitLayoutWidth(0);
      return;
    }

    let animationFrame = 0;
    const measureSplitLayoutWidth = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const nextWidth = layoutEl.clientWidth;
        setSplitLayoutWidth((prev) => (Math.abs(prev - nextWidth) < 0.5 ? prev : nextWidth));
      });
    };

    measureSplitLayoutWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureSplitLayoutWidth);
      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', measureSplitLayoutWidth);
      };
    }

    const resizeObserver = new ResizeObserver(measureSplitLayoutWidth);
    resizeObserver.observe(layoutEl);
    window.addEventListener('resize', measureSplitLayoutWidth);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureSplitLayoutWidth);
    };
  }, []);

  const updateExpandedIds = (nextIds: string[]) => {
    if (expandedNodeIds === undefined) setInternalExpandedIds(nextIds);
    onExpandedNodeIdsChange?.(nextIds);
  };

  const toggleExpanded = (nodeId: string) => {
    const nextSet = new Set(expandedSet);
    if (nextSet.has(nodeId)) {
      nextSet.delete(nodeId);
    } else {
      nextSet.add(nodeId);
    }
    updateExpandedIds(Array.from(nextSet));
  };

  const selectNode = (node: TNode) => {
    if (selectedNodeId === undefined) setInternalSelectedId(node.id);
    onNodeSelect?.(node);
  };

  useEffect(() => {
    setPage(0);
  }, [nodes]);

  useEffect(() => {
    const normalizedQuery = searchQuery?.trim().toLowerCase();
    if (!normalizedQuery) return;

    const match = allNodeMeta.find(({ node }) => getNodeSearchText(node).includes(normalizedQuery));
    if (!match) return;

    const nextExpandedSet = new Set(expandedSet);
    match.parentIds.forEach((id) => nextExpandedSet.add(id));
    updateExpandedIds(Array.from(nextExpandedSet));
    selectNode(match.node);

    const nextFlatNodes = flattenVisibleNodes(nodes, nextExpandedSet);
    const nextIndex = nextFlatNodes.findIndex(({ node }) => node.id === match.node.id);
    if (nextIndex >= 0 && rowsPerPage > 0) {
      setPage(Math.floor(nextIndex / rowsPerPage));
    }

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const selectedRow = rootRef.current?.querySelector('.MuiTableRow-root.Mui-selected') as HTMLElement | null;
        const tableContainer = selectedRow?.closest('.MuiTableContainer-root') as HTMLElement | null;
        if (selectedRow && tableContainer) {
          const containerRect = tableContainer.getBoundingClientRect();
          const rowRect = selectedRow.getBoundingClientRect();
          const rowTop = rowRect.top - containerRect.top + tableContainer.scrollTop;
          tableContainer.scrollTo({
            top: rowTop - tableContainer.clientHeight / 2 + rowRect.height / 2,
            behavior: 'smooth',
          });
          return;
        }
        selectedRow?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [searchQuery, searchToken, allNodeMeta, nodes, rowsPerPage]);

  const tableRows = useMemo(
    () =>
      flatNodes.map(({ node, level, hasChildren }) => ({
        ...node,
        id: node.id,
        __node: node,
        __level: level,
        __hasChildren: hasChildren,
        __expanded: expandedSet.has(node.id),
        __searchText: getNodeSearchText(node),
      })),
    [expandedSet, flatNodes],
  );

  const tableColumns = useMemo(
    () =>
      resolvedColumns.map((column, columnIndex) => ({
        id: column.id,
        label: column.label,
        minWidth:
          typeof column.width === 'number'
            ? column.width
            : column.minWidth ?? (columnIndex === 0 ? 320 : 120),
        numeric: column.numeric ?? column.align === 'right',
        render: (_value: unknown, row: Record<string, unknown>) => {
          const node = row.__node as TNode;
          const content = column.render ? column.render(node) : (node[column.id] as ReactNode);

          if (columnIndex !== 0) {
            return (
              <Box
                sx={{
                  minWidth: 0,
                  color: column.align === 'right' ? 'text.primary' : 'text.secondary',
                  fontWeight: column.align === 'right' ? 750 : 500,
                  textAlign: column.align ?? 'left',
                }}
              >
                {content}
              </Box>
            );
          }

          const level = Number(row.__level ?? 0);
          const hasChildren = Boolean(row.__hasChildren);
          const expanded = Boolean(row.__expanded);

          return (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0, pl: `${level * 24}px` }}
            >
              <CIconButton
                tooltip={hasChildren ? (expanded ? 'Collapse' : 'Expand') : ''}
                onClick={(event) => {
                  event.stopPropagation();
                  if (hasChildren) toggleExpanded(node.id);
                }}
                disabled={!hasChildren}
                sx={{
                  width: 24,
                  height: 24,
                  visibility: hasChildren ? 'visible' : 'hidden',
                  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 160ms ease',
                }}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
              </CIconButton>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: node.markerColor ?? theme.palette.primary.main,
                }}
              />
              <Box sx={{ minWidth: 0 }}>{content}</Box>
            </Stack>
          );
        },
      })),
    [resolvedColumns, expandedSet, theme.palette.primary.main],
  );

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!showSplitter) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      startX: event.clientX,
      startWidth: treePaneWidth,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      setTreePaneWidth(clampTreePaneWidth(dragState.startWidth + moveEvent.clientX - dragState.startX));
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const setEvenSplit = () => {
    const layoutWidth = splitRef.current?.clientWidth ?? 0;
    const nextWidth = layoutWidth > 0
      ? Math.max(minTreePaneWidth, (layoutWidth - SPLITTER_WIDTH) / 2)
      : DEFAULT_TREE_PANE_WIDTH;
    setPaneMode('split');
    setTreePaneWidth(clampTreePaneWidth(nextWidth));
  };

  const renderDetail = () => {
    if (!detail) return null;
    return typeof detail === 'function' ? detail(selectedNode) : detail;
  };

  const paneControls = detail ? (
    <Box
      sx={{
        position: 'absolute',
        top: 13,
        right: 56,
        zIndex: 3,
        display: 'flex',
        gap: 0.25,
        p: 0.5,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 8px 22px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.28 : 0.1)}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <CIconButton
        tooltip="Expand tree"
        onClick={() => setPaneMode('tree')}
        color={paneMode === 'tree' ? 'primary' : 'default'}
      >
        <KeyboardDoubleArrowRightOutlinedIcon fontSize="small" />
      </CIconButton>
      <CIconButton
        tooltip="Split evenly"
        onClick={setEvenSplit}
        color={paneMode === 'split' ? 'primary' : 'default'}
      >
        <SplitscreenOutlinedIcon fontSize="small" />
      </CIconButton>
      <CIconButton
        tooltip="Expand detail"
        onClick={() => setPaneMode('detail')}
        color={paneMode === 'detail' ? 'primary' : 'default'}
      >
        <KeyboardDoubleArrowLeftOutlinedIcon fontSize="small" />
      </CIconButton>
    </Box>
  ) : null;

  return (
    <Box
      ref={rootRef}
      className={['ctree_comp', className].filter(Boolean).join(' ')}
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 0,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        boxShadow: `0 18px 42px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.24 : 0.08)}`,
        ...sx,
      }}
    >
      {paneControls}
      <Box
        ref={splitRef}
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns,
          transition: `grid-template-columns ${PANE_TRANSITION}`,
          minWidth: 0,
        }}
      >
        <Box
          aria-hidden={treeCollapsed ? true : undefined}
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            opacity: treeCollapsed ? 0 : 1,
            transform: treeCollapsed ? 'translateX(-12px)' : 'translateX(0)',
            pointerEvents: treeCollapsed ? 'none' : 'auto',
            transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}`,
            willChange: 'opacity, transform',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ px: 2, py: 1.5, minHeight: 74, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Stack direction="row" alignItems="center" spacing={1.4} sx={{ minWidth: 0 }}>
              <AccountTreeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 750, lineHeight: 1.12 }} noWrap>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.3 }} noWrap>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>
            {headerAction !== undefined ? headerAction : (
              <CIconButton tooltip="Add node" color="default">
                <AddIcon fontSize="small" />
              </CIconButton>
            )}
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CTable
              appId={tableAppId}
              tableKey={tableKey}
              title={tableTitle ?? (typeof title === 'string' ? title : 'Tree')}
              columns={tableColumns}
              rows={tableRows}
              rowKey="id"
              fitContainer
              fullWidth
              showSummary={false}
              selectionMode="single"
              selected={activeSelectedId ? [activeSelectedId] : []}
              onSelectionChange={(nextSelected) => {
                const nextId = nextSelected[nextSelected.length - 1];
                const nextNode = allNodes.find((node) => node.id === nextId);
                if (nextNode) selectNode(nextNode);
              }}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              count={tableRows.length}
              onPageChange={setPage}
              onRowsPerPageChange={(nextRowsPerPage) => {
                setPage(0);
                setRowsPerPage(nextRowsPerPage);
              }}
              filterConfig={filterConfig}
              serviceUrl={serviceUrl}
              graphReport={{ enabled: false }}
              disableGrouping
              disableSorting
              maxHeight="100%"
            />
            {tableRows.length === 0 && (
              <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                {emptyLabel}
              </Box>
            )}
          </Box>
        </Box>

        <Box
          data-ctree-splitter="true"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={showSplitter ? startResize : undefined}
          sx={{
            width: '100%',
            cursor: showSplitter ? 'col-resize' : 'default',
            backgroundColor: showSplitter
              ? alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.16 : 0.08)
              : 'transparent',
            opacity: showSplitter ? 1 : 0,
            pointerEvents: showSplitter ? 'auto' : 'none',
            position: 'relative',
            transition: `opacity ${PANE_TRANSITION}, background-color 120ms ease`,
            '&:hover': {
              backgroundColor: showSplitter
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.18)
                : 'transparent',
            },
          }}
        />

        <Box
          aria-hidden={detailCollapsed ? true : undefined}
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            opacity: detailCollapsed ? 0 : 1,
            transform: detailCollapsed ? 'translateX(12px)' : 'translateX(0)',
            pointerEvents: detailCollapsed ? 'none' : 'auto',
            transition: `opacity ${PANE_TRANSITION}, transform ${PANE_TRANSITION}`,
            willChange: 'opacity, transform',
          }}
        >
          <Box sx={{ p: 2, pb: 1.25, minHeight: 74, display: 'flex', alignItems: 'flex-end' }}>
            <Divider sx={{ width: '100%' }} />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2 }}>
            {renderDetail()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
