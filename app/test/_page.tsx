import { hashPassword } from '@/util/password';

export const metadata = {
  title: 'Test',
};
export default async function TestPage() {
  const a = await hashPassword('12345678');
  return <div></div>;
}
