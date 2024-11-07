'use client';

import SearchBox from '@/components/(회계)/(판매)/(ListItem)/SearchBox';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ListItem from './(ListItem)/ListItem';

export default function SalesList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchOptions, setSearchOptions] = useState<any>({});
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const router = useRouter();

  const handleSearch = (term: string, options: any) => {
    setSearchTerm(term);
    setSearchOptions(options);
    setPage(1);
    setTriggerSearch(!triggerSearch);
  };

  const handleResetOptions = () => {
    setSearchOptions({});
  };

  useEffect(() => {
    // 다른 탭에서의 변경 감지
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'reloadSalesItems') {
        setTriggerSearch((prev) => !prev);
        localStorage.removeItem('reloadSalesItems');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return (
    <div>
      <SearchBox
        type="sales"
        onSearch={handleSearch}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        onResetOptions={handleResetOptions}
      />
      <ListItem
        searchTerm={searchTerm}
        searchOptions={searchOptions}
        page={page}
        setPage={setPage}
        triggerSearch={triggerSearch}
        setTriggerSearch={setTriggerSearch}
      />
    </div>
  );
}
