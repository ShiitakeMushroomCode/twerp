import { generatePdfBase64 } from '@/util/fetchPrintData';
import { generateCertificationToken, saveVerificationToken } from '@/util/token';
import Bull from 'bull';
import nodemailer from 'nodemailer';

interface EmailJob {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  option: 'MyPage' | 'SendMailSaleTransactionStatement' | 'SendMailPurchaseTransactionStatement';
  id?: string;
  userId?: string;
  cn?: string;
  companyIdData?: any;
}

// Bull 큐 생성
const emailQueue = new Bull<EmailJob>('email', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Nodemailer transporter 설정
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.SEND_MAIL,
    pass: process.env.MAIL_APP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
});

// 큐의 작업 처리
emailQueue.process(async (job) => {
  const { to, subject, html, text, option, id, userId, cn, companyIdData } = job.data;

  try {
    if (option === 'MyPage') {
      const mailOptions = {
        from: process.env.SEND_MAIL,
        to,
        subject,
        html,
      };
      await transporter.sendMail(mailOptions);
      if (userId && cn) {
        const token = await generateCertificationToken({ userId, cn });
        await saveVerificationToken(token);
      }
    } else if (option.endsWith('TransactionStatement')) {
      const mailOptions = {
        from: process.env.SEND_MAIL,
        to,
        subject,
        text,
        attachments: [
          {
            filename: '거래명세서.pdf',
            content: await generatePdfBase64(id, companyIdData, option),
            encoding: 'base64',
          },
        ],
      };
      await transporter.sendMail(mailOptions);
    }
    console.log(`${to}에게 ${subject} 같은 제목과 ${text} 같은 내용으로 메일을 보냄`);
  } catch (error) {
    console.log(`${to}에게 ${subject} 같은 제목과 ${text} 같은 내용으로 메일을 못보냄`);
    throw error;
  }
});

export default emailQueue;
