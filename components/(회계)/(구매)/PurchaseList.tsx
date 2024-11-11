'use client';

import PurchaseListItem from '@/components/(회계)/(구매)/(ListItem)/PurchaseListItem';
import SearchBox from '@/components/(회계)/(구매)/(ListItem)/SearchBox';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PurchaseList() {
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
      if (event.key === 'reloadPurchaseItems') {
        setTriggerSearch((prev) => !prev);
        localStorage.removeItem('reloadPurchaseItems');
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
        type="purchase"
        onSearch={handleSearch}
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        onResetOptions={handleResetOptions}
      />
      <PurchaseListItem
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
