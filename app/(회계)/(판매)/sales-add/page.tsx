import SalesForm from '@/components/(회계)/(판매)/SalesForm';

export const metadata = {
  title: '매출 입력',
};
export default async function Page() {
  return <SalesForm initialData={''} onSubmit={''} />;
}
