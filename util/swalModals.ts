import Swal from 'sweetalert2';

export async function openPhoneVerificationModal(
  newPhoneNumber: string,
  onClose: () => void,
  router: any // router를 매개변수로 전달
) {
  const { value: verificationCode } = await Swal.fire({
    title: '전화번호 변경 인증 코드 입력',
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
    const response = await fetch(`${process.env.API_URL}/verifyCodePhone`, {
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
      router.push('/signout'); // router 사용
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
    onClose();
  }
}

export async function openEmailVerificationModal(
  newEmail: string,
  onClose: () => void,
  router: any // router를 매개변수로 전달
) {
  const { value: verificationCode } = await Swal.fire({
    title: '이메일 변경 인증 코드 입력',
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
    const response = await fetch(`${process.env.API_URL}/verifyCodeEmail`, {
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
      router.push('/signout'); // router 사용
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
    onClose();
  }
}