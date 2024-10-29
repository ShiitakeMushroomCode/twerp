'use client';

import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

export default function useLoading(isLoading: boolean) {
  const isSwalOpen = useRef(false);

  useEffect(() => {
    if (isLoading && !isSwalOpen.current) {
      isSwalOpen.current = true;
      Swal.fire({
        title: '로딩 중...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else if (!isLoading && isSwalOpen.current) {
      Swal.close();
      isSwalOpen.current = false;
    }
  }, [isLoading]);
}
