import SalesForm from '@/components/(회계)/(판매)/SalesForm';

export const metadata = {
  title: '매출 정보 수정',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: PageProps) {
  return <SalesForm initialData={''} onSubmit={''} isEditMode={true} />;
}
