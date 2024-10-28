'use client';
import styles from '@/styles/MyPage.module.css';
import { formatPhoneNumber } from '@/util/reform';
import { useRef, useState } from 'react';
import VerificationEmailModal from './VerificationEmailModal';
import VerificationPhoneModal from './VerificationPhoneModal';

export default function ReForm({ sendMail }) {
  const [isSendMail, setIsSendMail] = useState(false);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const phoneFormRef = useRef(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const emailFormRef = useRef(null);

  function handleOpenPhoneModal() {
    if (newPhoneNumber.length >= 10 && newPhoneNumber.length <= 12) {
      setIsPhoneModalOpen(true);
    }
  }

  function handlePhoneChange(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setNewPhoneNumber(value);
      setPhoneNumber(formatPhoneNumber(value));
    }
  }

  function handleClosePhoneModal() {
    setPhoneNumber('');
    setNewPhoneNumber('');
    setIsSendMail(false);
    setIsPhoneModalOpen(false);
  }

  function handlePhoneSubmit(e) {
    e.preventDefault();
    if (!isSendMail) {
      if (newPhoneNumber.length >= 10 && newPhoneNumber.length <= 12) {
        setIsSendMail(true);
        alert('인증번호가 이메일로 발송되었습니다.');
        handleOpenPhoneModal();
        phoneFormRef.current.requestSubmit();
      } else {
        alert('전화번호는 10~12자리여야 합니다.');
      }
    }
  }

  function handleEmailChange(e) {
    setNewEmail(e.target.value);
  }

  function handleCloseEmailModal() {
    setNewEmail('');
    setIsSendMail(false);
    setIsEmailModalOpen(false);
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!isSendMail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(newEmail)) {
        setIsSendMail(true);
        alert('인증번호가 이메일로 발송되었습니다.');
        setIsEmailModalOpen(true);
        emailFormRef.current.requestSubmit();
      } else {
        alert('유효한 이메일 주소를 입력하세요.');
      }
    }
  }

  return (
    <div className={styles.reFormContent}>
      <form ref={phoneFormRef} action={sendMail} className={styles.info}>
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

      <form ref={emailFormRef} action={sendMail} className={styles.info}>
        <label className={styles.flabel}>이메일</label>
        <input
          type="email"
          className={styles.input}
          required
          placeholder="변경할 이메일 입력"
          autoComplete="off"
          value={newEmail}
          onChange={handleEmailChange}
          disabled={isSendMail}
        />
        <button onClick={handleEmailSubmit} className={styles.button} disabled={isSendMail}>
          이메일 변경
        </button>
      </form>

      {isPhoneModalOpen && (
        <VerificationPhoneModal
          newPhoneNumber={newPhoneNumber}
          isOpen={isPhoneModalOpen}
          onClose={handleClosePhoneModal}
        />
      )}

      {isEmailModalOpen && (
        <VerificationEmailModal newEmail={newEmail} isOpen={isEmailModalOpen} onClose={handleCloseEmailModal} />
      )}
    </div>
  );
}
