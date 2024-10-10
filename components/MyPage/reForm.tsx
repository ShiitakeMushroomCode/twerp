'use client';
import styles from '@/styles/MyPage.module.css';
import { useRef, useState } from 'react';
import VerificationModal from './VerificationModal';

export default function ReForm({ reformPhoneNumber, reformEmail }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const phoneFormRef = useRef(null);
  const handleOpenModal = () => {
    if (newPhoneNumber.length >= 10 && newPhoneNumber.length < 12) {
      setIsModalOpen(true);
    }
  };
  const handlePChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length < 12) {
      setNewPhoneNumber(value);
      if (value.length > 3 && value.length <= 6) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1-$2');
      } else if (value.length > 6 && value.length <= 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{1})/, '$1-$2-$3');
      } else if (value.length > 10) {
        value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
      }
      setPhoneNumber(value);
    }
  };

  const handleCloseModal = () => {
    setPhoneNumber('');
    setNewPhoneNumber('');
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPhoneNumber.length >= 10 && newPhoneNumber.length < 12) {
      alert('인증 메일이 발송되었습니다.');
      handleOpenModal();
      phoneFormRef.current.requestSubmit();
    } else {
      alert('전화번호는 10~11자리여야 합니다.');
    }
  };

  return (
    <div className={styles.reFormContent}>
      <form ref={phoneFormRef} action={reformPhoneNumber} className={styles.info}>
        <label className={styles.flabel}>전화번호</label>
        <input
          type="text"
          className={styles.input}
          required
          placeholder="변결 할 전화번호 입력"
          autoComplete="off"
          value={phoneNumber}
          onChange={handlePChange}
        />
        <button onClick={handleSubmit} className={styles.button}>
          전화번호 변경
        </button>
      </form>
      <form action={reformEmail} className={styles.info}>
        <label className={styles.flabel}>이메일</label>
        <input type="text" className={styles.input} />
        <button className={styles.button}>이메일 변경</button>
      </form>
      {isModalOpen && (
        <VerificationModal newPhoneNumber={newPhoneNumber} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
