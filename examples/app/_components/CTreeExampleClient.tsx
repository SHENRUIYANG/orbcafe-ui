'use client';

import { useMemo, useState, type ComponentProps } from 'react';
import {
  CAppPageLayout,
  CChip,
  CDetailInfoPage,
  CPageTransition,
  CStack,
  CTypography,
  CPaper,
  CTreeComp,
  useOrbMode,
  type CTreeCompColumn,
  type CTreeCompNode,
  type FilterField,
  type FilterValue,
} from 'orbcafe-ui';
import { EXAMPLE_MENU } from './exampleNavigation';

type CostKind = 'Assembly' | 'Material' | 'External' | 'Labor' | 'Overhead';
type CostStatus = 'Draft' | 'Costed' | 'Reviewed' | 'Blocked';

type CostTreeNode = CTreeCompNode & {
  code: string;
  kind: CostKind;
  source: string;
  plant: string;
  costBucket: string;
  status: CostStatus;
  supplier?: string;
  workCenter?: string;
  owner: string;
  version: string;
  qty?: number;
  uom?: string;
  unitCost?: number;
  total?: number;
  leadTimeDays?: number;
  scrapPercent?: number;
  marginPercent?: number;
  riskClass: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
};

type CostDetailSections = ComponentProps<typeof CDetailInfoPage>['sections'];
type CostDetailTabs = NonNullable<ComponentProps<typeof CDetailInfoPage>['tabs']>;
type CostDetailTable = NonNullable<ComponentProps<typeof CDetailInfoPage>['table']>;

const HeaderBrandLogo = () => {
  const mode = useOrbMode();
  const src = mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

  return (
    <img
      src={src}
      alt="ORBCAFE UI"
      style={{ width: 280, maxWidth: '32vw', height: 52, display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
};

const formatCurrency = (value?: number) => (value === undefined ? '' : `CN¥${Math.round(value).toLocaleString('en-US')}`);
const formatQty = (value?: number) => (value === undefined ? '' : value.toFixed(2));
const formatPercent = (value?: number) => (value === undefined ? '' : `${value.toFixed(1)}%`);
const filterRawValue = (filters: Record<string, FilterValue>, key: string) => filters[key]?.value;

const costTreeNodes: CostTreeNode[] = [
  {
    id: '100',
    code: '100',
    label: 'Complete Door Set',
    kind: 'Assembly',
    source: 'Costing structure',
    plant: 'CN01',
    costBucket: 'Finished goods',
    status: 'Draft',
    markerColor: '#1d72b8',
    owner: 'Costing Team',
    version: 'NSA241068-A',
    uom: 'SET',
    total: 3184,
    leadTimeDays: 14,
    scrapPercent: 1.5,
    marginPercent: 28,
    riskClass: 'Medium',
    lastUpdated: '2026-06-20',
    children: [
      {
        id: '110',
        code: '110',
        label: 'Door Leaf System',
        kind: 'Assembly',
        source: 'BOM rollup',
        plant: 'CN01',
        costBucket: 'Fabrication',
        status: 'Costed',
        markerColor: '#1d72b8',
        owner: 'MFG Costing',
        version: 'DL-04',
        uom: 'EA',
        total: 1198,
        leadTimeDays: 7,
        scrapPercent: 2.1,
        marginPercent: 24,
        riskClass: 'Medium',
        lastUpdated: '2026-06-19',
        children: [
          {
            id: '111',
            code: '111',
            label: 'Steel Shell Fabrication',
            kind: 'Assembly',
            source: 'BOM rollup',
            plant: 'CN01',
            costBucket: 'Sheet metal',
            status: 'Costed',
            markerColor: '#1d72b8',
            owner: 'Fabrication',
            version: 'FAB-2',
            uom: 'EA',
            total: 604,
            leadTimeDays: 3,
            scrapPercent: 2.8,
            marginPercent: 22,
            riskClass: 'Medium',
            lastUpdated: '2026-06-19',
            children: [
              { id: '111-10', code: '111-10', label: 'Galvanized Steel Sheet 1.2mm', kind: 'Material', source: 'SAP material price', plant: 'CN01', costBucket: 'Raw material', status: 'Reviewed', markerColor: '#13877f', supplier: 'Baosteel', owner: 'Material Costing', version: 'MAT-01', qty: 18.5, uom: 'KG', unitCost: 12, total: 216, leadTimeDays: 2, scrapPercent: 2.5, marginPercent: 18, riskClass: 'Low', lastUpdated: '2026-06-18' },
              { id: '111-20', code: '111-20', label: 'Laser Cutting Service', kind: 'External', source: 'Vendor condition', plant: 'CN01', costBucket: 'External process', status: 'Costed', markerColor: '#c91747', supplier: 'Suzhou LaserWorks', owner: 'Procurement', version: 'EXT-08', qty: 1, uom: 'LOT', unitCost: 154, total: 154, leadTimeDays: 1, scrapPercent: 0.4, marginPercent: 20, riskClass: 'Medium', lastUpdated: '2026-06-17' },
              { id: '111-30', code: '111-30', label: 'Door Skin Forming Labor', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'B26FORM1', owner: 'Routing', version: 'RTG-11', qty: 1.4, uom: 'H', unitCost: 82, total: 115, leadTimeDays: 1, scrapPercent: 0, marginPercent: 21, riskClass: 'Low', lastUpdated: '2026-06-18' },
              { id: '111-40', code: '111-40', label: 'Edge Reinforcement Strip', kind: 'Material', source: 'SAP material price', plant: 'CN01', costBucket: 'Raw material', status: 'Reviewed', markerColor: '#13877f', supplier: 'Orbis Metal', owner: 'Material Costing', version: 'MAT-03', qty: 6.8, uom: 'M', unitCost: 17, total: 116, leadTimeDays: 2, scrapPercent: 1.2, marginPercent: 19, riskClass: 'Low', lastUpdated: '2026-06-18' },
            ],
          },
          {
            id: '112',
            code: '112',
            label: 'Core and Insulation Pack',
            kind: 'Assembly',
            source: 'Quotation master',
            plant: 'CN01',
            costBucket: 'Insulation',
            status: 'Reviewed',
            markerColor: '#1d72b8',
            owner: 'Product Costing',
            version: 'CORE-7',
            uom: 'EA',
            total: 421,
            leadTimeDays: 4,
            scrapPercent: 1.1,
            marginPercent: 26,
            riskClass: 'Low',
            lastUpdated: '2026-06-16',
            children: [
              { id: '112-10', code: '112-10', label: 'Fire Rated Core Board', kind: 'Material', source: 'Quotation master', plant: 'CN01', costBucket: 'Bought-in material', status: 'Reviewed', markerColor: '#13877f', supplier: 'SafeCore', owner: 'Material Costing', version: 'MAT-12', qty: 2, uom: 'PC', unitCost: 166, total: 333, leadTimeDays: 3, scrapPercent: 0.8, marginPercent: 25, riskClass: 'Low', lastUpdated: '2026-06-16' },
              { id: '112-20', code: '112-20', label: 'Acoustic Sealant', kind: 'Material', source: 'SAP material price', plant: 'CN01', costBucket: 'Consumables', status: 'Costed', markerColor: '#13877f', supplier: 'Henkel CN', owner: 'Material Costing', version: 'MAT-18', qty: 1.2, uom: 'KG', unitCost: 44, total: 53, leadTimeDays: 1, scrapPercent: 1, marginPercent: 18, riskClass: 'Low', lastUpdated: '2026-06-15' },
              { id: '112-30', code: '112-30', label: 'Core Fit Labor', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'B26ASSY1', owner: 'Routing', version: 'RTG-10', qty: 0.45, uom: 'H', unitCost: 78, total: 35, leadTimeDays: 1, scrapPercent: 0, marginPercent: 20, riskClass: 'Low', lastUpdated: '2026-06-17' },
            ],
          },
          { id: '113', code: '113', label: 'Powder Coating Finish', kind: 'External', source: 'Vendor condition', plant: 'CN02', costBucket: 'Surface treatment', status: 'Blocked', markerColor: '#c91747', supplier: 'Kunshan Coating', owner: 'Procurement', version: 'EXT-12', qty: 5.2, uom: 'SQM', unitCost: 34, total: 177, leadTimeDays: 2, scrapPercent: 0.5, marginPercent: 23, riskClass: 'High', lastUpdated: '2026-06-11' },
        ],
      },
      {
        id: '120',
        code: '120',
        label: 'Frame Package',
        kind: 'Assembly',
        source: 'BOM rollup',
        plant: 'CN01',
        costBucket: 'Fabrication',
        status: 'Costed',
        markerColor: '#1d72b8',
        owner: 'Frame Team',
        version: 'FRM-05',
        uom: 'SET',
        total: 566,
        leadTimeDays: 5,
        scrapPercent: 1.8,
        marginPercent: 25,
        riskClass: 'Medium',
        lastUpdated: '2026-06-19',
        children: [
          { id: '121', code: '121', label: 'Frame Steel Profile', kind: 'Material', source: 'SAP material price', plant: 'CN01', costBucket: 'Raw material', status: 'Reviewed', markerColor: '#13877f', supplier: 'Orbis Metal', owner: 'Material Costing', version: 'MAT-22', qty: 12.4, uom: 'KG', unitCost: 13, total: 165, leadTimeDays: 2, scrapPercent: 2.2, marginPercent: 19, riskClass: 'Low', lastUpdated: '2026-06-18' },
          { id: '122', code: '122', label: 'Seal and Threshold Kit', kind: 'Material', source: 'Price item STD-FR-001', plant: 'CN01', costBucket: 'Bought-in material', status: 'Costed', markerColor: '#13877f', supplier: 'DoorParts Asia', owner: 'Material Costing', version: 'MAT-30', qty: 1, uom: 'SET', unitCost: 95, total: 95, leadTimeDays: 3, scrapPercent: 0.6, marginPercent: 24, riskClass: 'Low', lastUpdated: '2026-06-14' },
          { id: '123', code: '123', label: 'Frame Welding Cell', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'B26WELD1', owner: 'Routing', version: 'RTG-09', qty: 1.55, uom: 'H', unitCost: 92, total: 143, leadTimeDays: 1, scrapPercent: 0, marginPercent: 22, riskClass: 'Medium', lastUpdated: '2026-06-17' },
          { id: '124', code: '124', label: 'Frame Jig Overhead', kind: 'Overhead', source: 'Activity allocation', plant: 'CN01', costBucket: 'Machine overhead', status: 'Draft', markerColor: '#64748b', workCenter: 'B26WELD1', owner: 'Controlling', version: 'OH-02', qty: 1, uom: 'SET', unitCost: 163, total: 163, leadTimeDays: 0, scrapPercent: 0, marginPercent: 16, riskClass: 'Medium', lastUpdated: '2026-06-10' },
        ],
      },
      {
        id: '130',
        code: '130',
        label: 'Hardware Package',
        kind: 'Assembly',
        source: 'Selected fitting',
        plant: 'CN02',
        costBucket: 'Bought-in set',
        status: 'Reviewed',
        markerColor: '#1d72b8',
        owner: 'Product Costing',
        version: 'HDW-09',
        uom: 'SET',
        total: 514,
        leadTimeDays: 8,
        scrapPercent: 0.4,
        marginPercent: 30,
        riskClass: 'High',
        lastUpdated: '2026-06-15',
        children: [
          { id: '131', code: '131', label: 'Door Closer', kind: 'Material', source: 'SAP material price', plant: 'CN02', costBucket: 'Hardware', status: 'Reviewed', markerColor: '#13877f', supplier: 'Dorma', owner: 'Material Costing', version: 'MAT-41', qty: 1, uom: 'PC', unitCost: 144, total: 144, leadTimeDays: 6, scrapPercent: 0, marginPercent: 31, riskClass: 'Medium', lastUpdated: '2026-06-12' },
          { id: '132', code: '132', label: 'Heavy Duty Hinge', kind: 'Material', source: 'SAP material price', plant: 'CN02', costBucket: 'Hardware', status: 'Reviewed', markerColor: '#13877f', supplier: 'DoorParts Asia', owner: 'Material Costing', version: 'MAT-42', qty: 3, uom: 'PC', unitCost: 28, total: 83, leadTimeDays: 4, scrapPercent: 0, marginPercent: 27, riskClass: 'Low', lastUpdated: '2026-06-12' },
          { id: '133', code: '133', label: 'Mortise Lockset', kind: 'Material', source: 'SAP material price', plant: 'CN02', costBucket: 'Hardware', status: 'Reviewed', markerColor: '#13877f', supplier: 'ASSA ABLOY', owner: 'Material Costing', version: 'MAT-43', qty: 1, uom: 'PC', unitCost: 184, total: 184, leadTimeDays: 8, scrapPercent: 0, marginPercent: 32, riskClass: 'High', lastUpdated: '2026-06-12' },
          { id: '134', code: '134', label: 'Hardware Receiving Inspection', kind: 'Labor', source: 'Quality routing', plant: 'CN02', costBucket: 'Quality labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'Q26INSP1', owner: 'Quality', version: 'RTG-05', qty: 0.75, uom: 'H', unitCost: 78, total: 59, leadTimeDays: 1, scrapPercent: 0, marginPercent: 20, riskClass: 'Medium', lastUpdated: '2026-06-12' },
          { id: '135', code: '135', label: 'Inbound Freight Allocation', kind: 'Overhead', source: 'Activity allocation', plant: 'CN02', costBucket: 'Logistics', status: 'Draft', markerColor: '#64748b', owner: 'Controlling', version: 'OH-07', qty: 1, uom: 'SET', unitCost: 44, total: 44, leadTimeDays: 0, scrapPercent: 0, marginPercent: 14, riskClass: 'Medium', lastUpdated: '2026-06-09' },
        ],
      },
      {
        id: '200',
        code: '200',
        label: 'Final Production Routing',
        kind: 'Assembly',
        source: 'Routing rollup',
        plant: 'CN01',
        costBucket: 'Manufacturing',
        status: 'Costed',
        markerColor: '#1d72b8',
        owner: 'Routing',
        version: 'RTG-12',
        uom: 'SET',
        total: 906,
        leadTimeDays: 4,
        scrapPercent: 0.8,
        marginPercent: 23,
        riskClass: 'Medium',
        lastUpdated: '2026-06-17',
        children: [
          { id: '210', code: '210', label: 'Cutting and Forming', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'B26CUT1', owner: 'Routing', version: 'RTG-12', qty: 1.8, uom: 'H', unitCost: 82, total: 148, leadTimeDays: 1, scrapPercent: 0, marginPercent: 22, riskClass: 'Low', lastUpdated: '2026-06-17' },
          { id: '220', code: '220', label: 'Welding and Assembly', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Costed', markerColor: '#7c3aed', workCenter: 'B26WELD1', owner: 'Routing', version: 'RTG-12', qty: 2.4, uom: 'H', unitCost: 88, total: 211, leadTimeDays: 1, scrapPercent: 0, marginPercent: 22, riskClass: 'Medium', lastUpdated: '2026-06-17' },
          { id: '230', code: '230', label: 'Final Inspection', kind: 'Labor', source: 'Quality routing', plant: 'CN01', costBucket: 'Quality labor', status: 'Reviewed', markerColor: '#7c3aed', workCenter: 'Q26INSP1', owner: 'Quality', version: 'RTG-03', qty: 0.9, uom: 'H', unitCost: 80, total: 72, leadTimeDays: 1, scrapPercent: 0, marginPercent: 20, riskClass: 'Low', lastUpdated: '2026-06-17' },
          { id: '240', code: '240', label: 'Packaging and Palletizing', kind: 'Labor', source: 'Work center rate', plant: 'CN01', costBucket: 'Routing labor', status: 'Draft', markerColor: '#7c3aed', workCenter: 'B26PACK1', owner: 'Routing', version: 'RTG-06', qty: 0.85, uom: 'H', unitCost: 74, total: 63, leadTimeDays: 1, scrapPercent: 0, marginPercent: 21, riskClass: 'Low', lastUpdated: '2026-06-12' },
          { id: '250', code: '250', label: 'Manufacturing Overhead Pool', kind: 'Overhead', source: 'Activity allocation', plant: 'CN01', costBucket: 'Machine overhead', status: 'Draft', markerColor: '#64748b', owner: 'Controlling', version: 'OH-11', qty: 1, uom: 'SET', unitCost: 412, total: 412, leadTimeDays: 0, scrapPercent: 0, marginPercent: 16, riskClass: 'Medium', lastUpdated: '2026-06-10' },
        ],
      },
    ],
  },
];

const formatText = (value?: string | number) => (value === undefined || value === '' ? '-' : String(value));

const getKindColor = (kind: CostKind) => {
  if (kind === 'Material') return 'success';
  if (kind === 'External') return 'warning';
  if (kind === 'Labor') return 'secondary';
  if (kind === 'Overhead') return 'default';
  return 'primary';
};

const getKindColorBg = (kind: CostKind) => {
  if (kind === 'External') return 'rgba(243, 106, 58, 0.12)';
  if (kind === 'Overhead') return 'var(--orb-surface-2)';
  return 'rgba(39, 112, 255, 0.12)';
};

const buildDetailSearchText = (node: CostTreeNode) => [
  node.code,
  node.label,
  node.kind,
  node.source,
  node.plant,
  node.costBucket,
  node.status,
  node.supplier,
  node.workCenter,
  node.owner,
  node.version,
  node.riskClass,
].filter(Boolean).join(' ');

const buildCostDetailSections = (node: CostTreeNode): CostDetailSections => {
  const commercialBase = node.total ?? 0;
  const overheadRate = 8;
  const riskReserveRate = node.riskClass === 'High' ? 8 : 3;
  const targetMarginRate = node.marginPercent ?? 28;
  const discountRate = 4;
  const freight = 120;
  const grossPrice = commercialBase * (1 + overheadRate / 100 + riskReserveRate / 100 + targetMarginRate / 100) + freight;
  const netPrice = grossPrice * (1 - discountRate / 100);

  return [
    {
      id: 'component',
      title: 'Cost Component Maintenance',
      columns: 2,
      fields: [
        {
          id: 'component',
          label: 'Component',
          value: `${node.code} - ${node.label}`,
          searchableText: buildDetailSearchText(node),
        },
        {
          id: 'kind',
          label: 'Component Type',
          value: <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 16, fontSize: '0.875rem', fontWeight: 700, backgroundColor: getKindColorBg(node.kind), color: getKindColor(node.kind) }}>{node.kind}</span>,
          searchableText: node.kind,
        },
        { id: 'quantity', label: 'Quantity', value: formatQty(node.qty) || 'Rollup' },
        { id: 'unitCost', label: 'Unit Cost', value: formatCurrency(node.unitCost) || 'Rollup' },
        { id: 'uom', label: 'UoM', value: formatText(node.uom) },
        { id: 'lineTotal', label: 'Line Total', value: formatCurrency(node.total) || '-' },
      ],
    },
    {
      id: 'ownership',
      title: 'Ownership & Source',
      columns: 2,
      fields: [
        { id: 'plant', label: 'Plant', value: node.plant },
        { id: 'owner', label: 'Owner', value: node.owner },
        { id: 'source', label: 'Cost Source', value: node.source },
        { id: 'supplierWorkCenter', label: 'Supplier / Work Center', value: node.supplier ?? node.workCenter ?? '-' },
        { id: 'version', label: 'Version', value: node.version },
        { id: 'risk', label: 'Risk', value: node.riskClass },
      ],
    },
    {
      id: 'price',
      title: 'Sales Price Calculation',
      columns: 3,
      fields: [
        { id: 'baseCost', label: 'Base Cost', value: formatCurrency(commercialBase) || '-' },
        { id: 'factoryOverhead', label: 'Factory Overhead', value: `${overheadRate}%` },
        { id: 'riskReserve', label: 'Risk Reserve', value: `${riskReserveRate}%` },
        { id: 'targetMargin', label: 'Target Margin', value: `${targetMarginRate}%` },
        { id: 'customerDiscount', label: 'Customer Discount', value: `${discountRate}%` },
        { id: 'freight', label: 'Freight and Service Charge', value: formatCurrency(freight) },
        { id: 'grossPrice', label: 'Gross Sales Price', value: formatCurrency(grossPrice) },
        { id: 'netPrice', label: 'Customer Net Price', value: formatCurrency(netPrice) },
        { id: 'lastUpdated', label: 'Last Updated', value: node.lastUpdated },
      ],
    },
  ];
};

const buildCostDetailTabs = (node: CostTreeNode): CostDetailTabs => [
  {
    id: 'source',
    label: 'Source',
    description: 'Costing source, ownership and operational reference.',
    fields: [
      { id: 'status', label: 'Status', value: node.status },
      { id: 'bucket', label: 'Cost Bucket', value: node.costBucket },
      { id: 'supplier', label: 'Supplier', value: node.supplier ?? '-' },
      { id: 'workCenter', label: 'Work Center', value: node.workCenter ?? '-' },
      { id: 'leadTime', label: 'Lead Time', value: node.leadTimeDays === undefined ? '-' : `${node.leadTimeDays} d` },
      { id: 'scrap', label: 'Scrap', value: formatPercent(node.scrapPercent) || '-' },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    description: 'Commercial parameters used to calculate the customer-facing price.',
    sections: [
      {
        id: 'parameters',
        title: 'Pricing Parameters',
        columns: 2,
        fields: [
          { id: 'margin', label: 'Margin', value: formatPercent(node.marginPercent) || '-' },
          { id: 'riskClass', label: 'Risk Class', value: node.riskClass },
          { id: 'unitCost', label: 'Unit Cost', value: formatCurrency(node.unitCost) || 'Rollup' },
          { id: 'total', label: 'Line Total', value: formatCurrency(node.total) || '-' },
        ],
      },
    ],
  },
  {
    id: 'audit',
    label: 'Audit',
    fields: [
      { id: 'owner', label: 'Owner', value: node.owner },
      { id: 'version', label: 'Version', value: node.version },
      { id: 'updated', label: 'Last Updated', value: node.lastUpdated },
      { id: 'searchKey', label: 'Search Key', value: `${node.code} ${node.label}` },
    ],
  },
];

const buildCostDetailTable = (node: CostTreeNode): CostDetailTable => {
  const children = (node.children ?? []) as CostTreeNode[];
  const rows = children.length > 0
    ? children.map((child) => ({
      id: child.id,
      item: `${child.code} · ${child.label}`,
      type: child.kind,
      source: child.source,
      qty: formatQty(child.qty) || 'Rollup',
      uom: child.uom ?? '',
      amount: formatCurrency(child.total) || '-',
    }))
    : [
      { id: 'base', item: 'Base cost', type: 'Cost', source: node.source, qty: '1.00', uom: node.uom ?? '', amount: formatCurrency(node.total) || '-' },
      { id: 'overhead', item: 'Factory overhead', type: 'Loading', source: 'Commercial parameter', qty: '8%', uom: '', amount: formatCurrency((node.total ?? 0) * 0.08) },
      { id: 'reserve', item: 'Risk reserve', type: 'Loading', source: node.riskClass, qty: node.riskClass === 'High' ? '8%' : '3%', uom: '', amount: formatCurrency((node.total ?? 0) * (node.riskClass === 'High' ? 0.08 : 0.03)) },
      { id: 'freight', item: 'Freight and service charge', type: 'Charge', source: 'Manual costing', qty: '1.00', uom: 'SET', amount: formatCurrency(120) },
    ];

  return {
    title: children.length > 0 ? 'Lower-Level Cost Components' : 'Price Build-Up',
    tableProps: {
      appId: 'ctree-costing-detail',
      tableKey: `detail-${node.id}`,
      rowKey: 'id',
      columns: [
        { id: 'item', label: 'Item', minWidth: 220 },
        { id: 'type', label: 'Type', minWidth: 110 },
        { id: 'source', label: 'Source', minWidth: 160 },
        { id: 'qty', label: 'Qty', minWidth: 90 },
        { id: 'uom', label: 'UoM', minWidth: 80 },
        { id: 'amount', label: 'Amount', minWidth: 120 },
      ],
      rows,
      showToolbar: false,
      showSummary: false,
      fullWidth: true,
      maxHeight: '300px',
    },
  };
};

const CostDetail = ({ node }: { node: CostTreeNode | null }) => {
  const activeNode = node ?? costTreeNodes[0];
  const sections = useMemo(() => buildCostDetailSections(activeNode), [activeNode]);
  const tabs = useMemo(() => buildCostDetailTabs(activeNode), [activeNode]);
  const table = useMemo(() => buildCostDetailTable(activeNode), [activeNode]);

  return (
    <CDetailInfoPage
      title={`${activeNode.code} · ${activeNode.label}`}
      subtitle="Cost component detail, source context and commercial calculation"
      sections={sections}
      tabs={tabs}
      defaultTabId="source"
      table={table}
      searchBarWidth={360}
      rightHeaderSlot={
        <CChip
          size="small"
          color={getKindColor(activeNode.kind)}
          label={activeNode.kind}
          sx={{ fontWeight: 700 }}
        />
      }
      ai={{
        enabled: true,
        placeholder: 'Search component detail...',
        onSubmit: async (query) => [
          '### Costing Detail',
          `No exact detail field matched **${query}**.`,
          '',
          `- Component: **${activeNode.code} - ${activeNode.label}**`,
          `- Current source: **${activeNode.source}**`,
          `- Current total: **${formatCurrency(activeNode.total) || '-'}**`,
        ].join('\n'),
      }}
    />
  );
};

const filterFields: FilterField[] = [
  { id: 'locate', label: 'Find and locate', type: 'text', hasSearchIcon: true, placeholder: 'Code, supplier, work center...' },
  {
    id: 'kind',
    label: 'Component Type',
    type: 'select',
    options: ['Assembly', 'Material', 'External', 'Labor', 'Overhead'].map((value) => ({ label: value, value })),
  },
  {
    id: 'plant',
    label: 'Plant',
    type: 'select',
    options: ['CN01', 'CN02'].map((value) => ({ label: value, value })),
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: ['Draft', 'Costed', 'Reviewed', 'Blocked'].map((value) => ({ label: value, value })),
  },
  { id: 'source', label: 'Source', type: 'text', placeholder: 'SAP, vendor, routing...' },
  { id: 'minTotal', label: 'Minimum Total', type: 'number' },
];

const textMatches = (value: unknown, query: unknown) => {
  const text = String(value ?? '').toLowerCase();
  const needle = String(query ?? '').trim().toLowerCase();
  return !needle || text.includes(needle);
};

const numberMatches = (value: number | undefined, filter?: FilterValue) => {
  if (!filter || filter.value === '' || filter.value === undefined || filter.value === null) return true;
  const target = Number(value ?? 0);
  const raw = filter.value;
  const operator = filter.operator || '>=';

  if (operator === 'between' && Array.isArray(raw)) {
    const min = raw[0] === '' ? Number.NEGATIVE_INFINITY : Number(raw[0]);
    const max = raw[1] === '' ? Number.POSITIVE_INFINITY : Number(raw[1]);
    return target >= min && target <= max;
  }

  const filterNumber = Number(raw);
  if (Number.isNaN(filterNumber)) return true;
  if (operator === '=') return target === filterNumber;
  if (operator === '!=') return target !== filterNumber;
  if (operator === '>') return target > filterNumber;
  if (operator === '<') return target < filterNumber;
  if (operator === '<=') return target <= filterNumber;
  return target >= filterNumber;
};

const nodeMatchesFilters = (node: CostTreeNode, filters: Record<string, FilterValue>) => {
  const kind = filterRawValue(filters, 'kind');
  const plant = filterRawValue(filters, 'plant');
  const status = filterRawValue(filters, 'status');
  const source = filterRawValue(filters, 'source');

  if (kind && node.kind !== kind) return false;
  if (plant && node.plant !== plant) return false;
  if (status && node.status !== status) return false;
  if (!textMatches(`${node.source} ${node.supplier ?? ''} ${node.workCenter ?? ''}`, source)) return false;
  if (!numberMatches(node.total, filters.minTotal)) return false;
  return true;
};

const filterTree = (nodes: CostTreeNode[], filters: Record<string, FilterValue>): CostTreeNode[] => {
  const activeFilterCount = Object.entries(filters).filter(([key, filter]) => key !== 'locate' && filter?.value).length;
  if (activeFilterCount === 0) return nodes;

  return nodes.flatMap((node) => {
    const children = (node.children ?? []) as CostTreeNode[];
    const filteredChildren = filterTree(children, filters);
    const selfMatches = nodeMatchesFilters(node, filters);

    if (selfMatches) return [{ ...node, children }];
    if (filteredChildren.length > 0) return [{ ...node, children: filteredChildren }];
    return [];
  });
};

export default function CTreeExampleClient() {
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [locateToken, setLocateToken] = useState(0);
  const locateQuery = String(filters.locate?.value ?? '');
  const filteredNodes = useMemo(() => filterTree(costTreeNodes, filters), [filters]);

  const columns = useMemo<CTreeCompColumn<CostTreeNode>[]>(
    () => [
      {
        id: 'component',
        label: 'Cost component',
        minWidth: 360,
        render: (node) => (
          <CStack spacing={0.25} sx={{ minWidth: 0 }}>
            <CTypography sx={{ fontSize: 15, fontWeight: 780, lineHeight: 1.15 }} noWrap>
              {node.code} · {node.label}
            </CTypography>
            <CTypography sx={{ fontSize: 13, color: 'var(--orb-muted)' }} noWrap>
              {node.kind} · {node.source}
            </CTypography>
          </CStack>
        ),
      },
      { id: 'plant', label: 'Plant', minWidth: 92, render: (node) => node.plant },
      { id: 'costBucket', label: 'Cost bucket', minWidth: 160, render: (node) => node.costBucket },
      { id: 'status', label: 'Status', minWidth: 120, render: (node) => node.status },
      { id: 'supplier', label: 'Supplier', minWidth: 180, render: (node) => node.supplier ?? '' },
      { id: 'workCenter', label: 'Work center', minWidth: 140, render: (node) => node.workCenter ?? '' },
      { id: 'owner', label: 'Owner', minWidth: 150, render: (node) => node.owner },
      { id: 'version', label: 'Version', minWidth: 120, render: (node) => node.version },
      { id: 'qty', label: 'Qty', minWidth: 92, align: 'right', numeric: true, render: (node) => formatQty(node.qty) },
      { id: 'uom', label: 'UoM', minWidth: 86, render: (node) => node.uom ?? '' },
      { id: 'unitCost', label: 'Unit cost', minWidth: 128, align: 'right', numeric: true, render: (node) => formatCurrency(node.unitCost) },
      { id: 'total', label: 'Total', minWidth: 128, align: 'right', numeric: true, render: (node) => formatCurrency(node.total) },
      { id: 'leadTimeDays', label: 'Lead time', minWidth: 118, align: 'right', numeric: true, render: (node) => (node.leadTimeDays === undefined ? '' : `${node.leadTimeDays} d`) },
      { id: 'scrapPercent', label: 'Scrap', minWidth: 110, align: 'right', numeric: true, render: (node) => formatPercent(node.scrapPercent) },
      { id: 'marginPercent', label: 'Margin', minWidth: 110, align: 'right', numeric: true, render: (node) => formatPercent(node.marginPercent) },
      { id: 'riskClass', label: 'Risk', minWidth: 110, render: (node) => node.riskClass },
      { id: 'lastUpdated', label: 'Updated', minWidth: 128, render: (node) => node.lastUpdated },
    ],
    [],
  );

  return (
    <CAppPageLayout
      appTitle=""
      navigationVariant="v2"
      searchPlacement="header"
      menuData={EXAMPLE_MENU}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      onUserRefresh={() => window.location.reload()}
      onUserLogout={() => window.location.assign('/login')}
      logo={<HeaderBrandLogo />}
    >
      <CPageTransition transitionKey="ctree-demo" variant="fade" durationMs={180}>
        <div
          className="ctree_page"
          style={{
            height: 'calc(100vh - 84px)',
            minHeight: 680,
            overflow: 'hidden',
          }}
        >
          <CTreeComp<CostTreeNode>
            title="Cost Structure"
            subtitle="BOM, routing, overhead and sales-price components"
            nodes={filteredNodes}
            columns={columns}
            defaultSelectedNodeId="111-10"
            defaultExpandedNodeIds={['100', '110', '111', '112', '120', '130', '200']}
            detail={(node) => <CostDetail node={node} />}
            tableAppId="ctree-costing-demo"
            tableKey="cost-tree"
            tableTitle="Costing Structure"
            filterConfig={{
              appId: 'ctree-costing-demo',
              tableKey: 'cost-tree',
              fields: filterFields,
              filters,
              onFilterChange: setFilters,
              onSearch: () => setLocateToken((current) => current + 1),
              variants: [],
              currentVariantId: '',
              onVariantLoad: () => {},
              onVariantSave: () => {},
              onVariantDelete: () => {},
              onVariantSetDefault: () => {},
            }}
            searchQuery={locateQuery}
            searchToken={locateToken}
            minTreePaneWidth={640}
            minDetailPaneWidth={460}
            defaultRowsPerPage={20}
            rowsPerPageOptions={[20, 50, 100, -1]}
            headerAction={null}
            sx={{ height: '100%' }}
          />
        </div>
      </CPageTransition>
    </CAppPageLayout>
  );
}
