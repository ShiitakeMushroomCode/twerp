'use client';
import { formatPhoneNumber } from '@/util/reform';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import Logging from '../ETC/Logging';
import styles from './SignInPage.module.css';

export default function SigninForm({ signin }) {
  const [phoneNumber, setPhoneNumber] = useState(''); //010-1234-5678
  const [password, setPassword] = useState(''); //12345678
  const [error, setError] = useState('');
  const router = useRouter();

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setPassword(value);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length <= 12) {
      const formattedPhoneNumber = formatPhoneNumber(numericValue);
      setPhoneNumber(formattedPhoneNumber);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const response = await signin(formData);

    if (response === null) {
      setError('로그인에 실패하였습니다. 다시 시도하세요.');
    } else {
      router.push('/');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <Logging />
      <div className={styles.formGroup}>
        <label htmlFor="phone_number" className={styles.label}>
          전화번호:
        </label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          required
          placeholder="전화번호 입력"
          className={styles.input}
          title="전화번호는 숫자만 입력이 가능합니다."
          autoComplete="off"
          value={phoneNumber}
          onChange={handleChange}
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
          placeholder="비밀번호 입력"
          title="비밀번호는 최소 8자 이상이어야 하며, 영문 대문자 또는 소문자와 숫자를 포함해야 합니다. 특수문자는 선택 사항입니다."
          autoComplete="off"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      <button type="submit" className={styles.button}>
        로그인
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
}
