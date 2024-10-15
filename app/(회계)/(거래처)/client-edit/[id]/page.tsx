export const metadata = {
  title: '거래처 수정하기',
};
interface PageProps {
  params: {
    id: string;
  };
}
async function Check(id: string) {
  'use server';
}
export default async function Page({ params }: PageProps) {
  const data = await Check(params.id);
  return (
    <div>
      <h1>거래처 수정하는 곳</h1>
      <p></p>
    </div>
  );
}
