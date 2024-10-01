import { headers } from 'next/headers';

export const getIpAddress = async () => {
  //return headers().get('x-forwarded-for');
  const forwardedFor = headers().get('x-forwarded-for');
  return forwardedFor ? forwardedFor.split(',')[0] : null;
};
