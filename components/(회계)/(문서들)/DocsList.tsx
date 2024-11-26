'use client';

import DocsListItem from '@/components/(회계)/(문서들)/(ListItem)/DocsListItem';
import SearchBox from '@/components/(회계)/(문서들)/(ListItem)/SearchBox';

export default function DocsList() {
  return (
    <div>
      <SearchBox type='documents' onSearch={null} searchOptions={null} setSearchOptions={null} onResetOptions={null} />
      <DocsListItem />
    </div>
  );
}
