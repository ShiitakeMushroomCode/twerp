import ReForm from '@/components/MyPage/reForm';
import styles from '@/styles/MyPage.module.css';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { randomInt } from 'crypto';
import { cookies } from 'next/headers';

export const metadata = {
  title: '마이페이지',
};
async function getUserData() {
  'use server';
  return await getTokenUserData();
}
async function sendMail(formData): Promise<void> {
  'use server';
  const data = (await getTokenUserData()) as ACT;

  const cn = String(randomInt(0, 1000000)).padStart(6, '0');
  const html = `
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
                        <td style="padding: 20px; text-align: center; box-sizing: border-box;">
                            <h1 style="color: #333;">인증번호 발송</h1>
                            <p style="color: #555;">안녕하세요!</p>
                            <p style="color: #555;">귀하의 인증번호는 다음과 같습니다:</p>
                            <h2 style="font-size: 36px; color: #007BFF; margin: 20px 0;">${cn}</h2> 
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
  const response = await fetch(`${process.env.API_URL}/sendEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
    },
    body: JSON.stringify({
      userId: data.userId,
      to: data.email,
      subject: 'WERP 인증번호입니다.',
      html: html,
      cn: cn,
      type: 'reFormEmail',
      option: 'MyPage'
    }),
  });
  if (response.ok) {
    console.log('인증 메일 보냈다.');
  }
}

export default async function MyPage() {
  const user = (await getUserData()) as ACT;
  const [year, month, day] = user.hireDate.split('-');
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>마이페이지</h1>
        <div className={styles.content}>
          <p className={styles.info}>
            <span className={styles.label}>이름:</span> {user.name || '없음'}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>부서:</span> {user.department || '없음'}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>직급:</span> {user.position || '없음'}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>이메일:</span> {user.email || '없음'}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>전화번호:</span>{' '}
            {user.userId.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') || '없음'}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>입사일:</span> {`${year}년 ${+month}월 ${+day}일`}
          </p>
        </div>
        <hr />
        <h1 className={styles.title}>개인정보 변경</h1>

        <ReForm sendMail={sendMail} />
      </div>
    </div>
  );
}
