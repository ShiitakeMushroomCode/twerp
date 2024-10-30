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
  const handleAdd = () => {
    router.push('/items-add');
  };

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
      <button onClick={handleAdd} className={styles.button}>
        추가
      </button>
    </div>
  );
}
