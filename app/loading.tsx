import Spinner from '@/components/ETC/Spinner/Spinner';
export const metadata = {
  title: '로딩중...',
};
export default async function Page() {
  return <Spinner />;
}
