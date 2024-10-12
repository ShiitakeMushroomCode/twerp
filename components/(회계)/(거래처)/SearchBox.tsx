'use client';

import styles from '@/styles/SearchBox.module.css';
import { useState } from 'react';

interface SearchBoxProps {
  onSearch: (term: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [input, setInput] = useState<string>('');

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
    </div>
  );
}
