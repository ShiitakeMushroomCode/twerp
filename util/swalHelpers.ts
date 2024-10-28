import Swal from 'sweetalert2';

export const showSuccessAlert = async (title: string, text: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: '확인',
  });
};

export const showErrorAlert = async (title: string, text: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: '확인',
  });
};

export const showWarningAlert = async (title: string, text: string) => {
  return await Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: '확인',
  });
};
