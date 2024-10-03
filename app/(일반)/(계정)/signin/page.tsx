import styles from '@/styles/SignInPage.module.css';

export const metadata = {
  title: '로그인',
};

export default async function SignInPage() {
  async function signin(formData: FormData) {
    'use server';
    console.log(formData);
  }

  return (
    <form action={signin} className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="phone_number" className={styles.label}>
          전화번호:
        </label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          required
          placeholder="전화번호 입력 (숫자만 11자리)"
          className={styles.input}
          pattern="\d{11}"
          title="전화번호는 11자리 숫자여야 합니다. (010####-####)"
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          비밀번호:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={styles.input}
          placeholder="비밀번호 입력 (영문, 숫자, 특수문자 선택)"
          pattern="(?=.*\d)(?=.*[a-zA-Z])[A-Za-z\d@$!%*?&]{8,}"
          title="비밀번호는 최소 8자 이상이어야 하며, 영문 대문자 또는 소문자와 숫자를 포함해야 합니다. 특수문자는 선택 사항입니다."
        />
      </div>
      <button type="submit" className={styles.button}>
        로그인
      </button>
    </form>
  );
}
