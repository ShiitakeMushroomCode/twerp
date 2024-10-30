'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ListItem from './ListItem';
import SearchBox from './SearchBox';

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const router = useRouter();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    setTriggerSearch(!triggerSearch);
  };
  useEffect(() => {
    // storage 이벤트를 통해 다른 탭에서 발생한 변경 감지
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'reloadItems') {
        setTriggerSearch((prev) => !prev);
        localStorage.removeItem('reloadItems');
      }
    };

    // storage 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);

    // 컴포넌트가 언마운트될 때 리스너 제거
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);
  return (
    <div>
      <SearchBox onSearch={handleSearch} />
      <ListItem
        searchTerm={searchTerm}
        page={page}
        setPage={setPage}
        triggerSearch={triggerSearch}
        setTriggerSearch={setTriggerSearch}
      />
    </div>
  );
}
