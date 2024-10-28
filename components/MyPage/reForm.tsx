'use client';
import styles from '@/styles/MyPage.module.css';
import { formatPhoneNumber } from '@/util/reform';
import { openEmailVerificationModal, openPhoneVerificationModal } from '@/util/swalModals';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Swal from 'sweetalert2';

export default function ReForm({ sendMail }: { sendMail: () => void }) {
  const [isSendMail, setIsSendMail] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const phoneFormRef = useRef<HTMLFormElement>(null);
  const emailFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter(); // useRouter 훅 호출

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setNewPhoneNumber(value);
      setPhoneNumber(formatPhoneNumber(value));
    }
  }

  async function handlePhoneSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (newPhoneNumber.length >= 10 && newPhoneNumber.length <= 12) {
      setIsSendMail(true);
      phoneFormRef.current?.requestSubmit(); // 메일 발송
      await openPhoneVerificationModal(
        newPhoneNumber,
        () => {
          setIsSendMail(false);
        },
        router
      ); // router 전달
    } else {
      await Swal.fire({
        title: '잘못된 입력',
        text: '전화번호는 10~12자리여야 합니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }

  async function handleEmailSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newEmail)) {
      setIsSendMail(true);
      emailFormRef.current?.requestSubmit(); // 메일 발송
      await openEmailVerificationModal(
        newEmail,
        () => {
          setIsSendMail(false);
        },
        router
      ); // router 전달
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
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isSendMail}
        />
        <button onClick={handleEmailSubmit} className={styles.button} disabled={isSendMail}>
          이메일 변경
        </button>
      </form>
    </div>
  );
}
