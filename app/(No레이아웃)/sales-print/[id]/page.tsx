import SalesPrintFormComponent from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { fetchSalesData } from '@/util/fetchPrintData';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';

export const metadata = {
  title: '거래명세표 출력',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: PageProps) {
  const salesFormData = await fetchSalesData(id, ((await getTokenUserData()) as ACT)['companyId']['data']);
  return <SalesPrintFormComponent salesFormData={salesFormData} />;
}
