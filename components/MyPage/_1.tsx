'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import styles from './VerificationModal.module.css';

interface VerificationEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEmail: string | undefined;
}

export default function VerificationEmailModal({ newEmail, isOpen, onClose }: VerificationEmailModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(300); // 타이머 초기화

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          Swal.fire({
            title: '시간 만료',
            text: '시간이 만료되었습니다. 다시 시도해주세요.',
            icon: 'warning',
            confirmButtonText: '확인',
          }).then(() => {
            onClose();
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  async function handleSubmit() {
    const response = await fetch(`/api/verifyCodeEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputCode: verificationCode, newEmail: newEmail }),
    });

    const result = await response.json();
    if (response.ok) {
      await Swal.fire({
        title: '성공',
        text: result.message,
        icon: 'success',
        confirmButtonText: '확인',
      });
      router.push('/signout');
      onClose();
    } else {
      await Swal.fire({
        title: '오류',
        text: result.error,
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.h2}>인증 코드 입력</h2>
        <br />
        <input
          type="text"
          placeholder="인증 코드를 입력하세요"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSubmit} className={styles.submitButton}>
          확인
        </button>
        <div className={styles.timer}>
          남은 시간: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          닫기
        </button>
      </div>
    </div>
  );
}
