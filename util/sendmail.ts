'use server';

import { cookies } from 'next/headers';

export async function sendMailUtil({
  to = null,
  subject = null,
  html = null,
  option = null,
  text = null,
  id = null,
  cn = null,
}): Promise<boolean> {
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
      cn: cn,
    }),
  });
  if (response.ok) {
    return true;
  } else {
    return false;
  }
}
