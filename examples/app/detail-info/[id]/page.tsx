import DetailInfoExampleClient from './DetailInfoExampleClient';

interface DetailInfoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailInfoExamplePage({ params }: DetailInfoPageProps) {
  const { id } = await params;
  return <DetailInfoExampleClient rowId={id} />;
}
