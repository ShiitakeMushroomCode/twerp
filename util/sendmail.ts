'use server';

import { cookies } from 'next/headers';

export async function sendMailUtil({ to, subject, html, option, text, id }): Promise<boolean> {
  const response = await fetch(`${process.env.API_URL}/sendEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
    },
    body: JSON.stringify({
      to: to,
      subject: subject,
      html: html,
      option: option,
      text: text,
      id: id,
    }),
  });
  if (response.ok) {
    return true;
  } else {
    return false;
  }
}
