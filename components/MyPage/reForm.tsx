'use client';
import styles from '@/styles/MyPage.module.css';
import { formatPhoneNumber } from '@/util/reform';
import {
  openEmailVerificationModal,
  openPasswordVerificationModal,
  openPhoneVerificationModal,
} from '@/util/swalModals';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface ReFormProps {
  sendMail: (formData: any) => Promise<void>;
}

export default function ReForm({ sendMail }: ReFormProps) {
  const [isSendMail, setIsSendMail] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    setter(e.target.value);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setNewPhoneNumber(value);
    setPhoneNumber(formatPhoneNumber(value));
  }

  async function handleVerification(inputCode: string, newData: string, type: string) {
    setIsSendMail(true);
    try {
      const res = await fetch(`/api/verifyCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inputCode, newData, type }),
      });

      if (res.ok) {
        const data = await res.json();
        await Swal.fire({
          title: '성공',
          text: data.message,
          icon: 'success',
          showConfirmButton: false,
          timer: 1000,
        });
        setNewPhoneNumber('');
        setNewEmail('');
        setNewPassword('');
        setTimeout(() => router.refresh(), 1000);
      } else {
        throw new Error((await res.json()).message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {
      await Swal.fire({
        title: '실패',
        text: error.message || '코드 검증 실패.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    } finally {
      setIsSendMail(false);
    }
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    newData: string,
    validation: () => boolean,
    modalOpener: () => Promise<string | undefined>,
    type: string,
    formDataKey: string
  ) {
    e.preventDefault();
    if (validation()) {
      setIsSendMail(true);
      try {
        await Swal.fire({
          title: '이메일 발송 완료',
          text: '이메일을 확인하세요.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false,
        });
        setTimeout(async () => {
          const inputCode = await modalOpener();
          if (inputCode) {
            handleVerification(inputCode, newData, type);
          } else {
            setIsSendMail(false);
          }
        }, 1000);
        await sendMail({ [formDataKey]: newData });
      } catch (error) {
        console.error(`${type} 변경 중 오류 발생:`, error);
        setIsSendMail(false);
      }
    } else {
      await Swal.fire({
        title: '잘못된 입력',
        text: `${type}의 형식을 확인해주세요.`,
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  return (
    <div className={styles.reFormContent}>
      <form className={styles.info}>
        <span className={styles.flabel}>전화번호</span>
        <input
          type='text'
          name='phoneNumber'
          className={styles.input}
          required
          placeholder='변경할 전화번호 입력'
          autoComplete='off'
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={isSendMail}
        />
        <button
          onClick={(e) =>
            handleSubmit(
              e,
              newPhoneNumber,
              () => newPhoneNumber.length >= 10 && newPhoneNumber.length <= 12,
              openPhoneVerificationModal,
              '전화번호',
              'phoneNumber'
            )
          }
          className={styles.button}
          disabled={isSendMail}
        >
          전화번호 변경
        </button>
      </form>

      <form className={styles.info}>
        <span className={styles.flabel}>이메일</span>
        <input
          name='email'
          type='email'
          className={styles.input}
          required
          placeholder='변경할 이메일 입력'
          autoComplete='off'
          value={newEmail}
          onChange={(e) => handleInputChange(e, setNewEmail)}
          disabled={isSendMail}
        />
        <button
          onClick={(e) =>
            handleSubmit(
              e,
              newEmail,
              () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail),
              openEmailVerificationModal,
              '이메일',
              'email'
            )
          }
          className={styles.button}
          disabled={isSendMail}
        >
          이메일 변경
        </button>
      </form>

      <form className={styles.info}>
        <span className={styles.flabel}>비밀번호</span>
        <input
          name='password'
          type='password'
          className={styles.input}
          required
          placeholder='변경할 비밀번호 입력'
          autoComplete='off'
          value={newPassword}
          onChange={(e) => handleInputChange(e, setNewPassword)}
          disabled={isSendMail}
        />
        <button
          onClick={(e) =>
            handleSubmit(
              e,
              newPassword,
              () => newPassword.length >= 8 && newPassword.length <= 20,
              openPasswordVerificationModal,
              '비밀번호',
              'password'
            )
          }
          className={styles.button}
          disabled={isSendMail}
        >
          비밀번호 변경
        </button>
      </form>
    </div>
  );
}
