'use client';
import { useEffect } from 'react';

export function useUnsavedChangesWarning() {
  // 창 닫기나 새로고침 방지
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 이벤트 리스너 정리
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
