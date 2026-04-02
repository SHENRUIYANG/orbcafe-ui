import DetailInfoExampleClient from './DetailInfoExampleClient';

interface DetailInfoPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const getStringParam = (value: string | string[] | undefined) => (typeof value === 'string' ? value : undefined);

export default async function DetailInfoExamplePage({ params, searchParams }: DetailInfoPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <DetailInfoExampleClient
      rowId={id}
      source={getStringParam(resolvedSearchParams.source)}
      sourceBucketId={getStringParam(resolvedSearchParams.bucket)}
      sourceBucketTitle={getStringParam(resolvedSearchParams.bucketTitle)}
      backHref={getStringParam(resolvedSearchParams.backHref)}
    />
  );
}
