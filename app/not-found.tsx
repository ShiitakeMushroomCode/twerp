// import { getIpAddress } from '@/util/getIpAddress';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found',
};
export default function NotFound() {
  //console.log(getIpAddress());
  return <div>존재하지 않는 페이지입니다.</div>;
}
