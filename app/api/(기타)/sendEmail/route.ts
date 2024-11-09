import { generatePdfBase64 } from '@/util/fetchSalesData';
import { generateCertificationToken, saveVerificationToken } from '@/util/token';
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
  const { userId, to, subject, cn, html, option, id, text } = await request.json();
  // 인증 코드 생성
  if (option === 'MyPage') {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        html: html,
      };
      await transporter.sendMail(mailOptions);
      await saveVerificationToken(await generateCertificationToken({ userId: userId, cn: cn }));
      return NextResponse.json({ message: '이메일이 성공적으로 전송되었습니다..' }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: '이메일 전송에 실패하였습니다.' }, { status: 500 });
    }
  } else if (option === 'SalesTransactionStatement') {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        attachments: [
          {
            filename: '거래명세서.pdf',
            content: await generatePdfBase64(id),
            encoding: 'base64',
          },
        ],
      };
      await transporter.sendMail(mailOptions);
      return NextResponse.json({ message: '이메일이 성공적으로 전송되었습니다..' }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: '이메일 전송에 실패하였습니다.' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: '잘못 된 옵션입니다.' }, { status: 500 });
  }
}
