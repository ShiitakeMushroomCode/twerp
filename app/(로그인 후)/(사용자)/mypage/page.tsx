import styles from '@/styles/MyPage.module.css';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';

export const metadata = {
  title: '마이페이지',
};
async function getUserData() {
  'use server';
  return await getTokenUserData();
}
async function reformPhoneNumber(formData) {
  'use server';
}
async function reformEmail(formData) {
  'use server';
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
            <span className={styles.label}>입사일:</span> {user.hireDate.toString()}
          </p>
        </div>
        <hr />
        <h1 className={styles.title}>개인정보 변경</h1>
        <div className={styles.reFormContent}>
          <form action={reformPhoneNumber} className={styles.info}>
            <label className={styles.flabel}>전화번호</label>
            <input type="text" className={styles.input} />
            <button className={styles.button}>전화번호 변경</button>
          </form>
          <form action={reformEmail} className={styles.info}>
            <label className={styles.flabel}>이메일</label>
            <input type="text" className={styles.input} />
            <button className={styles.button}>이메일 변경</button>
          </form>
        </div>
      </div>
    </div>
  );
}
