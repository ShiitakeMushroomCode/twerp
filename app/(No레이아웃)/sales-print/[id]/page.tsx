// import EmailSalesInvoice from '@/components/(회계)/(판매)/(Print)/EmailSalesInvoice';
import SalesPrintFormComponent from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { fetchSalesData } from '@/util/fetchSalesData';

export const metadata = {
  title: '거래명세표 출력',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: PageProps) {
  const salesFormData = await fetchSalesData(id);
  return <SalesPrintFormComponent salesFormData={salesFormData} />;

  // return <Invoice fetchSalesData={await fetchSalesData(id)}/>
}
