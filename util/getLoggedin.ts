'use server';

import { cookies } from 'next/headers';

export async function getLoggedin() {
  return cookies().has('accessToken');
}
