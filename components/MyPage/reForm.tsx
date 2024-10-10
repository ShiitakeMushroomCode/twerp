'use client';
import styles from '@/styles/MyPage.module.css';
import { useState } from 'react';
import VerificationModal from './VerificationModal';

export default function ReForm({ reformPhoneNumber, reformEmail }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // 모달 닫기
  };
  return (
    <div className={styles.reFormContent}>
      <form action={reformPhoneNumber} className={styles.info}>
        <label className={styles.flabel}>전화번호</label>
        <input type="text" className={styles.input} />
        <button
          onClick={() => {
            alert('인증 메일이 발송되었습니다.');
            handleOpenModal();
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
      {isModalOpen && <VerificationModal isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  );
}
