import ReForm from '@/components/MyPage/reForm';
import styles from '@/styles/MyPage.module.css';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
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
  const response = await fetch(`/api/sendEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies().toString(),
    },
    body: JSON.stringify({
      userId: data.userId,
      to: data.email,
      subject: 'WERP 인증번호입니다.',
      type: 'reFormEmail',
    }),
  });
  if (response.ok) {
    console.log('인증 메일 보냈다.');
  }
}

export default async function MyPage() {
  const user = (await getUserData()) as ACT;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>마이페이지</h1>
        <div className={styles.content}>
          <p className={styles.info}>
            <span className={styles.label}>이름:</span> {user.name}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>부서:</span> {user.department}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>직급:</span> {user.position}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>이메일:</span> {user.email}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>전화번호:</span> {user.userId.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
          </p>
          <p className={styles.info}>
            <span className={styles.label}>입사일:</span>{' '}
            {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
              new Date(user.hireDate)
            )}
          </p>
        </div>
        <hr />
        <h1 className={styles.title}>개인정보 변경</h1>

        <ReForm sendMail={sendMail} />
      </div>
    </div>
  );
}
