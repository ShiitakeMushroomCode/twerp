import styles from '@/styles/MyPage.module.css';
import getSession from 'temp/Session';

export const metadata = {
  title: '마이페이지',
};

export default async function MyPage() {
  const user = getSession().user;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>마이페이지</h1>
        <p className={styles.info}>
          <span className={styles.label}>이름:</span> {user.name}
        </p>
        <p className={styles.info}>
          <span className={styles.label}>이메일:</span> {user.email}
        </p>
        <p className={styles.info}>
          <span className={styles.label}>전화번호:</span> {user.phone}
        </p>
        <p className={styles.info}>
          <span className={styles.label}>회사:</span> {user.company}
        </p>
      </div>
    </div>
  );
}
