import Swal from 'sweetalert2';

/**
 * 전화번호 인증 모달을 열고 사용자가 입력한 코드를 반환
 * @returns Promise<string | null>
 */
export function openPhoneVerificationModal(): Promise<string | null> {
  return Swal.fire({
    title: '전화번호 인증',
    input: 'text',
    inputLabel: '인증 코드를 입력하세요',
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    inputValidator: (value) => {
      if (!value) {
        return '인증 코드를 입력해야 합니다.';
      }
      return null;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  });
}

/**
 * 이메일 인증 모달을 열고 사용자가 입력한 코드를 반환
 * @returns Promise<string | null>
 */
export function openEmailVerificationModal(): Promise<string | null> {
  return Swal.fire({
    title: '이메일 인증',
    input: 'text',
    inputLabel: '인증 코드를 입력하세요',
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    inputValidator: (value) => {
      if (!value) {
        return '인증 코드를 입력해야 합니다.';
      }
      return null;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  });
}

/**
 * 비밀번호 인증 모달을 열고 사용자가 입력한 코드를
 * @returns Promise<string | null>
 */
export function openPasswordVerificationModal(): Promise<string | null> {
  return Swal.fire({
    title: '비밀번호 인증',
    input: 'password',
    inputLabel: '인증 코드를 입력하세요',
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    inputAttributes: {
      autocapitalize: 'off',
    },
    inputValidator: (value) => {
      if (!value) {
        return '인증 코드를 입력해야 합니다.';
      }
      return null;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  });
}
