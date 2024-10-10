'use client';
import styles from '@/styles/VerificationModal.module.css';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPhoneNumber: string | undefined;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ newPhoneNumber, isOpen, onClose }) => {
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
          onClose();
          alert('시간이 만료되었습니다. 다시 시도해주세요.');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSubmit = async () => {
    const response = await fetch(`/api/verifyCodePhone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputCode: verificationCode, newPhoneNumber: newPhoneNumber }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      router.push('/signout');
      onClose();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.h2}>인증 코드 입력</h2>
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
};
export default VerificationModal;
