import CheckList from '@/components/List/CheckList';

export const metadata = {
  title: '매출 목록',
};
export default async function Page() {
  return (
    <div>
      <CheckList option={1} />
    </div>
  );
}
