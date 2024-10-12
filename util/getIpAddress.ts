import { headers } from 'next/headers';

export async function getIpAddress() {
  //return headers().get('x-forwarded-for');
  const forwardedFor = headers().get('x-forwarded-for');
  return forwardedFor ? forwardedFor.split(',')[0] : null;
}
