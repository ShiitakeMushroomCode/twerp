'use client';
import styles from '@/styles/MyPage.module.css';
import { formatPhoneNumber } from '@/util/reform';
import {
  openEmailVerificationModal,
  openPasswordVerificationModal,
  openPhoneVerificationModal,
} from '@/util/swalModals';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
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
  const phoneFormRef = useRef<HTMLFormElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  /**
   * 전화번호 입력 핸들러
   */
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setNewPhoneNumber(value);
      setPhoneNumber(formatPhoneNumber(value));
    }
  }

  /**
   * 인증 코드 검증 및 데이터 전송 핸들러
   */
  async function handleVerification(inputCode: string, newData: string, type: string) {
    setIsSendMail(true);
    try {
      const res = await fetch(`/api/verifyCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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

        // 1초 뒤 로그아웃으로 이동
        setTimeout(() => {
          router.push('/signout');
        }, 1000);
      } else {
        const data = await res.json();
        throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
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

  /**
   * 비밀번호 변경 핸들러
   */
  async function handlePasswordSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (newPassword.length >= 8 && newPassword.length <= 20) {
      setIsSendMail(true);

      try {
        // 이메일 발송 완료 창 띄우기
        await Swal.fire({
          title: '이메일 발송 완료',
          text: '이메일을 확인하세요.',
          icon: 'success',
          timer: 1000, // 1초 후 자동 닫힘
          showConfirmButton: false,
        });

        // 1초 뒤 모달 열기
        setTimeout(async () => {
          const inputCode = await openPasswordVerificationModal();
          if (inputCode) {
            handleVerification(inputCode, newPassword, '비밀번호');
          } else {
            setIsSendMail(false);
          }
        }, 1000); // 1초 지연

        // 비밀번호 변경을 위한 이메일 발송
        const formData = { password: newPassword };
        await sendMail(formData);
      } catch (error) {
        console.error('비밀번호 변경 중 오류 발생:', error);
        setIsSendMail(false);
      }
    } else {
      await Swal.fire({
        title: '잘못된 입력',
        text: '패스워드는 8~20자리여야 합니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  /**
   * 전화번호 변경 핸들러
   */
  async function handlePhoneSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (newPhoneNumber.length >= 10 && newPhoneNumber.length <= 12) {
      setIsSendMail(true);

      try {
        // 이메일 발송 완료 창 띄우기
        await Swal.fire({
          title: '이메일 발송 완료',
          text: '이메일을 확인하세요.',
          icon: 'success',
          timer: 1000, // 1초 후 자동 닫힘
          showConfirmButton: false,
        });

        // 1초 뒤 모달 열기
        setTimeout(async () => {
          const inputCode = await openPhoneVerificationModal();
          if (inputCode) {
            handleVerification(inputCode, newPhoneNumber, '전화번호');
          } else {
            setIsSendMail(false);
          }
        }, 1000); // 1초 지연

        // 전화번호 변경을 위한 이메일 발송
        const formData = { phoneNumber: newPhoneNumber };
        await sendMail(formData);
      } catch (error) {
        console.error('전화번호 변경 중 오류 발생:', error);
        setIsSendMail(false);
      }
    } else {
      await Swal.fire({
        title: '잘못된 입력',
        text: '전화번호는 10~12자리여야 합니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  /**
   * 이메일 변경 핸들러
   */
  async function handleEmailSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newEmail)) {
      setIsSendMail(true);

      try {
        // 이메일 발송 완료 창 띄우기
        await Swal.fire({
          title: '이메일 발송 완료',
          text: '이메일을 확인하세요.',
          icon: 'success',
          timer: 1000, // 1초 후 자동 닫힘
          showConfirmButton: false,
        });

        // 1초 뒤 모달 열기
        setTimeout(async () => {
          const inputCode = await openEmailVerificationModal();
          if (inputCode) {
            handleVerification(inputCode, newEmail, '이메일');
          } else {
            setIsSendMail(false);
          }
        }, 1000); // 1초 지연

        // 이메일 변경을 위한 이메일 발송
        const formData = { email: newEmail };
        await sendMail(formData);
      } catch (error) {
        console.error('이메일 변경 중 오류 발생:', error);
        setIsSendMail(false);
      }
    } else {
      await Swal.fire({
        title: '잘못된 입력',
        text: '유효한 이메일 주소를 입력하세요.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  return (
    <div className={styles.reFormContent}>
      {/* 전화번호 변경 폼 */}
      <form ref={phoneFormRef} className={styles.info}>
        <label className={styles.flabel}>전화번호</label>
        <input
          type="text"
          className={styles.input}
          required
          placeholder="변경할 전화번호 입력"
          autoComplete="off"
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={isSendMail}
        />
        <button onClick={handlePhoneSubmit} className={styles.button} disabled={isSendMail}>
          전화번호 변경
        </button>
      </form>

      {/* 이메일 변경 폼 */}
      <form ref={emailFormRef} className={styles.info}>
        <label className={styles.flabel}>이메일</label>
        <input
          type="email"
          className={styles.input}
          required
          placeholder="변경할 이메일 입력"
          autoComplete="off"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isSendMail}
        />
        <button onClick={handleEmailSubmit} className={styles.button} disabled={isSendMail}>
          이메일 변경
        </button>
      </form>

      {/* 비밀번호 변경 폼 */}
      <form ref={passwordFormRef} className={styles.info}>
        <label className={styles.flabel}>비밀번호</label>
        <input
          type="password"
          className={styles.input}
          required
          placeholder="변경할 비밀번호 입력"
          autoComplete="off"
          value={newPassword} // 비밀번호 상태와 연동
          onChange={(e) => setNewPassword(e.target.value)} // 비밀번호 상태 업데이트
          disabled={isSendMail}
        />
        <button onClick={handlePasswordSubmit} className={styles.button} disabled={isSendMail}>
          비밀번호 변경
        </button>
      </form>
    </div>
  );
}
