'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  onSearch: (term: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [input, setInput] = useState<string>('');
  const router = useRouter();

  function handleAdd(isNewTab: boolean) {
    if (isNewTab) {
      // 팝업 창 크기와 위치 설정 (예: 600x400 크기의 창, 중앙에 열기)
      const width = 600;
      const height = 400;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // 팝업 창으로 열기 위한 세부 설정
      const popupWindow = window.open(
        `/client-add`,
        `editClientPopup-${Date.now()}`, // 창의 이름
        `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
      );

      // 새 창을 열었을 때 그 창이 최상위로 뜨도록 처리
      if (popupWindow) {
        popupWindow.focus();
      }
    } else {
      // 기존 탭에서 이동
      router.push(`/client-add`);
    }
  }
  const handleSearch = () => {
    onSearch(input.trim());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder="검색어를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearch} className={styles.button}>
        검색
      </button>
      <button
        onClick={(event) => {
          handleAdd(event.ctrlKey || event.metaKey);
        }}
        className={styles.button}
      >
        추가
      </button>
    </div>
  );
}
