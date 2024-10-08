import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.SEND_MAIL, // Gmail 아이디
    pass: process.env.MAIL_APP_PASSWORD, // 앱 비밀번호
  },
});

export async function POST(request: NextRequest) {
  const { to, subject, text, html, cn, type } = await request.json();
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    // 타입 구분해서 cn값 저장 후 원래 페이지에서 모달창 띄워 입력받기
    return NextResponse.json({ message: '이메일 전송 성공적' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '이메일 전송 실패' }, { status: 500 });
  }
}

export function getCNumberHtml(code) {
  return `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WERP 인증번호입니다.</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
              <td align="center">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                      <tr>
                          <td style="padding: 20px; text-align: center;">
                              <h1 style="color: #333;">인증번호 발송</h1>
                              <p style="color: #555;">안녕하세요!</p>
                              <p style="color: #555;">귀하의 인증번호는 다음과 같습니다:</p>
                              <h2 style="font-size: 36px; color: #007BFF; margin: 20px 0;">${code}</h2> 
                              <p style="color: #555;">감사합니다!</p>
                          </td>
                      </tr>
                      <tr>
                          <td style="background-color: #f4f4f4; padding: 10px; text-align: center;">
                              <p style="color: #999; font-size: 12px;">이 이메일은 자동으로 생성된 메시지입니다. 회신하지 마십시오.</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
`;
}
