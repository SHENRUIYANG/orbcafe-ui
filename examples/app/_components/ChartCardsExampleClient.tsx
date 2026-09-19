'use client';

import { useState } from 'react';
import {
  CMetricChartCard,
  CPageTransition,
  CPaper,
  CStack,
  CTypography,
  type MetricChartDatum,
} from 'orbcafe-ui';
import { ExamplePageLayout } from './ExamplePageLayout';
import { EXAMPLE_MENU } from './exampleNavigation';

const categoryData: MetricChartDatum[] = [
  { id: 'ax', label: 'AX', value: 184 },
  { id: 'ay', label: 'AY', value: 142 },
  { id: 'az', label: 'AZ', value: 96 },
  { id: 'bx', label: 'BX', value: 76 },
  { id: 'by', label: 'BY', value: 61 },
  { id: 'bz', label: 'BZ', value: 44 },
  { id: 'cx', label: 'CX', value: 31 },
  { id: 'cy', label: 'CY', value: 20 },
  { id: 'cz', label: 'CZ', value: 12 },
];

const controllerData: MetricChartDatum[] = [
  { id: 'anna', label: 'Anna Müller', value: 148 },
  { id: 'ben', label: 'Ben Fischer', value: 121 },
  { id: 'chi', label: 'Chi Zhang', value: 96 },
  { id: 'diego', label: 'Diego Costa', value: 84 },
  { id: 'eva', label: 'Eva Novak', value: 62 },
];

const locationData: MetricChartDatum[] = [
  { id: 'de10', label: 'DE10 Berlin', value: 168 },
  { id: 'de20', label: 'DE20 Munich', value: 132 },
  { id: 'cn10', label: 'CN10 Shanghai', value: 118 },
  { id: 'us10', label: 'US10 Chicago', value: 87 },
  { id: 'fr10', label: 'FR10 Lyon', value: 54 },
];

const acquisitionData: MetricChartDatum[] = [
  { id: 'inhouse', label: 'In-house', value: 210 },
  { id: 'external', label: 'External', value: 162 },
  { id: 'stock', label: 'Stock transfer', value: 120 },
  { id: 'subcontract', label: 'Subcontracting', value: 83 },
  { id: 'unknown', label: 'Unassigned', value: 24 },
];

const strategyData: MetricChartDatum[] = [
  { id: 'make', label: 'Make-to-stock', value: 132 },
  { id: 'order', label: 'Make-to-order', value: 108 },
  { id: 'kanban', label: 'Kanban', value: 72 },
  { id: 'reorder', label: 'Reorder point', value: 51 },
  { id: 'project', label: 'Project', value: 26 },
];

const planningGroupData: MetricChartDatum[] = [
  { id: 'p1', label: 'PG-01', value: 122, secondaryValue: 94 },
  { id: 'p2', label: 'PG-02', value: 104, secondaryValue: 66 },
  { id: 'p3', label: 'PG-03', value: 82, secondaryValue: 52 },
  { id: 'p4', label: 'PG-04', value: 57, secondaryValue: 28 },
  { id: 'p5', label: 'PG-05', value: 39, secondaryValue: 18 },
];

const productLevelData: MetricChartDatum[] = [
  { id: 'finished', label: 'Finished product', value: 212 },
  { id: 'semi', label: 'Semi-finished', value: 156 },
  { id: 'component', label: 'Component', value: 118 },
  { id: 'raw', label: 'Raw material', value: 93 },
  { id: 'packaging', label: 'Packaging', value: 42 },
];

const number = (value: number) => value.toLocaleString();

export default function ChartCardsExampleClient() {
  const [active, setActive] = useState<{ card: string; item: MetricChartDatum } | null>(null);
  const handleItemClick = (card: string) => (item: MetricChartDatum) => setActive({ card, item });

  return (
    <ExamplePageLayout
      appId="orbcafe-examples"
      appTitle=""
      navigationVariant="v2"
      searchPlacement="header"
      menuData={EXAMPLE_MENU}
      locale="en"
      localeLabel="EN"
      user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de', avatarSrc: '/orbcafe.png' }}
      onUserRefresh={() => window.location.reload()}
      onUserLogout={() => window.location.assign('/login')}
    >
      <CPageTransition transitionKey="chart-cards" variant="fade" durationMs={180}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CPaper sx={{ padding: 20, borderRadius: 16 }}>
            <CStack spacing={0.75}>
              <CTypography variant="overline">Reusable ORBIS patterns</CTypography>
              <CTypography variant="h2">Metric chart cards</CTypography>
              <CTypography muted>
                Compact cards for ABC × XYZ dimensions. Use the selector in each card to compare chart styles; click a mark or row to drive the shared detail filter.
              </CTypography>
              {active && (
                <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--orb-primary-bg)', color: 'var(--orb-primary)', fontSize: 12 }} role="status">
                  Selected <strong>{active.item.label}</strong> in {active.card} · {number(active.item.value)} materials
                </div>
              )}
            </CStack>
          </CPaper>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, alignItems: 'stretch' }}>
            <CMetricChartCard
              title="Analysis materials"
              subtitle="Current filtered scope"
              data={[{ id: 'total', label: 'Classified materials', value: 768, secondaryValue: 86 }]}
              chartType="metric"
              showChartTypeControl={false}
              valueFormatter={number}
              secondaryValueFormatter={(value) => `${value}%`}
              secondaryValueLabel="Classification coverage"
            />
            <CMetricChartCard
              title="Classification change"
              subtitle="Compared with the previous run"
              data={[{ id: 'changed', label: 'Changed', value: 186 }, { id: 'unchanged', label: 'Unchanged', value: 582 }]}
              chartType="progress"
              valueFormatter={number}
              onItemClick={handleItemClick('classification change')}
              activeId={active?.card === 'classification change' ? active.item.id : undefined}
            />
            <CMetricChartCard title="Classification distribution" subtitle="AX · AY · AZ …" data={categoryData} maxItems={9} chartType="donut" valueFormatter={number} onItemClick={handleItemClick('classification distribution')} activeId={active?.card === 'classification distribution' ? active.item.id : undefined} />
            <CMetricChartCard title="Planning controller" subtitle="Materials by responsible planner" data={controllerData} chartType="bar" valueFormatter={number} onItemClick={handleItemClick('planning controller')} activeId={active?.card === 'planning controller' ? active.item.id : undefined} />
            <CMetricChartCard title="Storage location" subtitle="Materials by plant location" data={locationData} chartType="column" valueFormatter={number} onItemClick={handleItemClick('storage location')} activeId={active?.card === 'storage location' ? active.item.id : undefined} />
            <CMetricChartCard title="Acquisition type" subtitle="Sorted dimension sequence" data={acquisitionData} chartType="line" valueFormatter={number} onItemClick={handleItemClick('acquisition type')} activeId={active?.card === 'acquisition type' ? active.item.id : undefined} />
            <CMetricChartCard title="Strategy group" subtitle="Index vs. material count" data={strategyData} chartType="scatter" valueFormatter={number} onItemClick={handleItemClick('strategy group')} activeId={active?.card === 'strategy group' ? active.item.id : undefined} />
            <CMetricChartCard title="Planning group" subtitle="Count and stock value" data={planningGroupData} chartType="bubble" valueFormatter={number} secondaryValueFormatter={(value) => `${number(value)} k€`} onItemClick={handleItemClick('planning group')} activeId={active?.card === 'planning group' ? active.item.id : undefined} />
            <CMetricChartCard title="Product hierarchy" subtitle="Accessible tabular view" data={productLevelData} chartType="list" valueFormatter={number} onItemClick={handleItemClick('product hierarchy')} activeId={active?.card === 'product hierarchy' ? active.item.id : undefined} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <CMetricChartCard title="Loading state" subtitle="Async data" data={[]} loading chartType="bar" />
            <CMetricChartCard title="Empty state" subtitle="No matching materials" data={[]} chartType="donut" emptyState="No materials match the current filters." />
            <CMetricChartCard title="Error state" subtitle="Service unavailable" data={[]} chartType="bar" error="Could not load this dimension." />
          </div>
        </div>
      </CPageTransition>
    </ExamplePageLayout>
  );
}
