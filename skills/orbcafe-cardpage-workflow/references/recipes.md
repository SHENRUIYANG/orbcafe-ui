# CardPage Recipes

## Recipe 1: Standard integrated card page

```tsx
import { CCardPage, useCardPage, OrbcafeI18nProvider, type CardPageMetadata, type CCardItem } from 'orbcafe-ui';

const metadata: CardPageMetadata = {
  id: 'app-store-page',
  title: 'App Store',
  filters: [
    { id: 'search', label: 'Search', type: 'text', placeholder: 'Search apps...' },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Analytics', value: 'analytics' },
        { label: 'AI', value: 'ai' },
      ],
    },
  ],
  variants: [
    {
      id: 'all-apps',
      name: 'All Apps',
      isDefault: true,
      scope: 'Both',
      filters: [
        {
          scope: 'default',
          filters: { values: {}, visibleFields: ['search', 'category'] },
        },
      ],
    },
  ],
};

export default function AppStorePage() {
  const { pageProps } = useCardPage({
    metadata,
    fetchData: async (params) => {
      // Same contract as useStandardReport: read filter values from params,
      // return { rows, total }. Rows are CCardItem-shaped.
      const res = await fetch('/api/apps', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return res.json(); // { rows: CCardItem[], total: number }
    },
    onDetailClick: (item) => console.log('view details', item.id), // also fires when the built-in panel opens (analytics)
    onDownloadClick: (item) => console.log('download', item.id),
  });

  return (
    <OrbcafeI18nProvider locale="en">
      <div style={{ height: 'calc(100vh - 120px)' }}>
        <CCardPage {...pageProps} />
      </div>
    </OrbcafeI18nProvider>
  );
}
```

Notes for Recipe 1:

- Keep `metadata.id`, `CCardPage.id`, and SmartFilter `appId` aligned. With `useCardPage`, `metadata.id` is propagated for you.
- Card items must satisfy `CCardItem`: `{ id, title, description?, icon?, iconNode?, meta? }`. Extra business fields (e.g. `category`, `vendor`, `rating`) can be added flat on the item — the built-in detail panel lists all primitive extra fields automatically.
- Clicking the card's "view details" icon opens the built-in centered detail card (`CCardDetailPanel`) AND fires `onDetailClick`. Clicking "download" fires `onDownloadClick`; the same handler backs the panel's footer button.
- Variants persist filter values + visible fields only (no table layout on CardPage). Without `serviceUrl`/`variantService`, variants persist in localStorage under `orbcafe.variants.${appId}.${tableKey}`.

## Recipe 2: Custom detail panel content

Use `renderDetailContent` when the default "full description + extra fields" body is not enough (e.g. screenshots, changelog, action groups). The panel chrome (header/footer/close/Esc/backdrop) stays built-in.

```tsx
const { pageProps } = useCardPage({
  metadata,
  fetchData,
  onDownloadClick: (item) => download(item.id),
});

<CCardPage
  {...pageProps}
  gridProps={{
    ...pageProps.gridProps,
    renderDetailContent: (item) => (
      <div>
        <img src={item.screenshotUrl as string} alt="" style={{ maxWidth: '100%' }} />
        <p>{item.description}</p>
      </div>
    ),
  }}
/>
```

## Recipe 3: Route-navigation detail instead of the panel

Use `detailPanel={false}` when the business flow requires a real detail route. Then `onDetailClick` is the only detail behavior.

```tsx
const router = useRouter();

const { pageProps } = useCardPage({
  metadata,
  fetchData,
  onDetailClick: (item) => router.push(`/apps/${item.id}`),
});

<CCardPage
  {...pageProps}
  gridProps={{ ...pageProps.gridProps, detailPanel: false }}
/>
```

## Recipe 4: Standalone CCardDetailPanel

Use the panel directly when you already have your own list/grid and only need the centered detail card.

```tsx
import { CCardDetailPanel, type CCardItem } from 'orbcafe-ui';

const [item, setItem] = useState<CCardItem | null>(null);

<CCardDetailPanel
  item={item!}
  open={!!item}
  onClose={() => setItem(null)}
  onDownloadClick={(it) => download(it.id)}
/>
```

Notes for Recipe 4:

- The panel renders through a portal to `document.body`; do not wrap it in your own `position: fixed` container (page containers like `CPageTransition` carry `will-change: transform`, which would clip fixed positioning).
- `item` must stay non-null while the close transition runs; control visibility with `open`, not by unmounting.
