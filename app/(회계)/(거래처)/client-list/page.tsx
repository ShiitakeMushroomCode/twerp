import ClientList from '@/components/(회계)/(거래처)/ClientList';

export const metadata = {
  title: '거래처 목록',
};

export default async function Page() {
  return (
    <div>
      <ClientList />
    </div>
  );
}
