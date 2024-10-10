'use client';
import styles from '@/styles/MyPage.module.css';

export default function ReForm({ reformPhoneNumber, reformEmail }) {
  return (
    <div className={styles.reFormContent}>
      <form action={reformPhoneNumber} className={styles.info}>
        <label className={styles.flabel}>전화번호</label>
        <input type="text" className={styles.input} />
        <button
          onClick={() => {
            alert('인증 메일이 발송되었습니다.');
          }}
          className={styles.button}
        >
          전화번호 변경
        </button>
      </form>
      <form action={reformEmail} className={styles.info}>
        <label className={styles.flabel}>이메일</label>
        <input type="text" className={styles.input} />
        <button className={styles.button}>이메일 변경</button>
      </form>
    </div>
  );
}
