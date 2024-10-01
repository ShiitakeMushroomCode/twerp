import { headers } from 'next/headers';
export const metadata = {
  title: 'Home',
};
export default async function Page() {
  const header = headers();
  const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
  return <div>{true ? null : ip}</div>;
}
