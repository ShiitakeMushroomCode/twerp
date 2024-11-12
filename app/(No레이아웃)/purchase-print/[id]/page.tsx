import PurchasesPrintFormComponent from '@/components/(회계)/(구매)/(Print)/PurchasePrintForm';
import { fetchPurchasesData } from '@/util/fetchPrintData';
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
  const purchasesFormData = await fetchPurchasesData(id, ((await getTokenUserData()) as ACT)['companyId']['data']);
  return <PurchasesPrintFormComponent purchasesFormData={purchasesFormData} />;
}
