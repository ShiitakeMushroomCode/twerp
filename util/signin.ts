'use server';

import { cookies } from 'next/headers';

export async function signin(formData: FormData) {
  try {
    const data = {
      id: formData.get('phone_number'),
      password: formData.get('password'),
    };
    const response = await fetch(`${process.env.API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    if (response.ok) {
      const data = await response.json();
      cookies().set({
        name: 'accessToken',
        value: data.accessToken,
        httpOnly: true,
        maxAge: 30 * 60,
        path: '/',
        sameSite: 'strict',
        secure: true,
      });
      cookies().set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'strict',
        secure: true,
      });
      window.location.reload();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
