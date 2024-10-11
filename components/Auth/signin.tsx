import styles from '@/styles/SignInPage.module.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export default function SinginForm() {
  async function signin(formData: FormData) {
    'use server';
    try {
      const data = {
        id: formData.get('phone_number'),
        password: formData.get('password'),
      };
      const response = await fetch(`${process.env.API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });
      if (response.ok) {
        const data = await response.json();
        cookies().set({
          name: 'accessToken',
          value: data.accessToken,
          httpOnly: true,
          maxAge: 30 * 60,
          path: '/',
          sameSite: 'strict',
          secure: true,
        });
        cookies().set({
          name: 'refreshToken',
          value: data.refreshToken,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
          sameSite: 'strict',
          secure: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (cookies().has('accessToken') && cookies().has('refreshToken')) {
        redirect('/mypage');
      }
    }
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
          title="전화번호는 11자리 숫자여야 합니다. (010########)"
          autoComplete="off"
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
          minLength={8}
          placeholder="비밀번호 입력 (영문, 숫자, 특수문자 선택)"
          // pattern="(?=.*\d)(?=.*[a-zA-Z])[A-Za-z\d@$!%*?&]{8,}"
          title="비밀번호는 최소 8자 이상이어야 하며, 영문 대문자 또는 소문자와 숫자를 포함해야 합니다. 특수문자는 선택 사항입니다."
          autoComplete="off"
        />
      </div>
      <button type="submit" className={styles.button}>
        로그인
      </button>
    </form>
  );
}
