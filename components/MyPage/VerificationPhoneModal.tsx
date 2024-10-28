import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export async function openPhoneVerificationModal(newPhoneNumber: string, onClose: () => void) {
  const router = useRouter();

  const { value: verificationCode } = await Swal.fire({
    title: '전화번호 인증 코드 입력',
    input: 'text',
    inputPlaceholder: '인증 코드를 입력하세요',
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    timer: 300000, // 5분 타이머
    timerProgressBar: true,
    inputValidator: (value) => {
      if (!value) {
        return '인증 코드를 입력해야 합니다!';
      }
    },
  });

  if (verificationCode) {
    // 인증 코드 확인 API 요청
    const response = await fetch(`/api/verifyCodePhone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputCode: verificationCode, newPhoneNumber: newPhoneNumber }),
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
  } else {
    // 모달이 닫힐 때 처리
    onClose();
  }
}
