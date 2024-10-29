'use client';

import { useState } from 'react';
import ListItem from './ListItem';
import SearchBox from './SearchBox';

export default function ItemList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    setTriggerSearch(!triggerSearch);
  };

  return (
    <div>
      <SearchBox onSearch={handleSearch} />
      <ListItem searchTerm={searchTerm} page={page} setPage={setPage} triggerSearch={triggerSearch} />
    </div>
  );
}
