'use client';
import React, { useEffect, useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  newPhoneNumber: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, userId, newPhoneNumber }) => {
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [verificationCode, setVerificationCode] = useState<string>('');

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
    const response = await fetch(`${process.env.API_URL}/verifyCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, inputCode: verificationCode, newPhoneNumber }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      onClose();
    } else {
      alert(result.error);
    }
  };

  return (
    isOpen && (
      <div className="modal">
        <h2>인증 코드 입력</h2>
        <input
          type="text"
          placeholder="인증 코드를 입력하세요"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <button onClick={handleSubmit}>확인</button>
        <div className="timer">
          남은 시간: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>
    )
  );
};

export default VerificationModal;
