import PurchaseList from '@/components/(회계)/(거래)/(구매)/PurchaseList';

export const metadata = {
  title: '매입 목록',
};
export default async function Page() {
  return <PurchaseList />;
}
