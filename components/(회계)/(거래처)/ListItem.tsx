'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
import { formatPhoneNumber } from '@/util/reform';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ListItem.module.css';

interface Company {
  business_number: string;
  company_id: string;
  company_name: string;
  is_registered: boolean;
  clients_id: string;
  representative_name: string;
  tell_number: string;
  fax_number: string;
}

interface ListItemProps {
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
  triggerSearch: boolean;
}

export default function ListItem({ searchTerm, page, setPage, triggerSearch }: ListItemProps) {
  const [data, setData] = useState<Company[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('company_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 15;
  const router = useRouter();

  // 상세 페이지로 이동하는 함수
  function editRoute(clients_id: string) {
    router.push(`/client-edit/${clients_id}`);
  }

  // 정렬을 처리하는 함수
  function handleSort(column: string) {
    if (sortColumn === column) {
      // 같은 열을 클릭하면 정렬 순서를 토글합니다.
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 열을 클릭하면 해당 열로 정렬하고 순서는 오름차순으로 설정합니다.
      setSortColumn(column);
      setSortOrder('asc');
    }
    // 정렬이 변경되면 페이지를 첫 번째 페이지로 리셋합니다.
    setPage(1);
  }

  // 데이터 Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/clientListData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTerm,
            page,
            pageSize,
            sortColumn,
            sortOrder,
          }),
        });
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setData(result.data);
          setTotal(result.total);
        } else {
          console.error('데이터 형식이 올바르지 않습니다:', result);
        }
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [triggerSearch, page, searchTerm, sortColumn, sortOrder]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead className={styles.tableHeader}>
                <tr>
                  <th onClick={() => handleSort('business_number')}>
                    <span className={styles.headerCell}>
                      사업자번호
                      <span className={styles.sortArrow}>
                        {sortColumn === 'business_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('company_name')}>
                    <span className={styles.headerCell}>
                      기업명
                      <span className={styles.sortArrow}>
                        {sortColumn === 'company_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('representative_name')}>
                    <span className={styles.headerCell}>
                      대표자명
                      <span className={styles.sortArrow}>
                        {sortColumn === 'representative_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('tell_number')}>
                    <span className={styles.headerCell}>
                      대표번호
                      <span className={styles.sortArrow}>
                        {sortColumn === 'tell_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('fax_number')}>
                    <span className={styles.headerCell}>
                      팩스번호
                      <span className={styles.sortArrow}>
                        {sortColumn === 'fax_number' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={item.clients_id}
                      className={styles.tableRow}
                      onClick={() => {
                        editRoute(item.clients_id);
                      }}
                    >
                      <td className={styles.centerAlign}>
                        {item.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
                      </td>
                      <td className={styles.leftAlign}>{item.company_name}</td>
                      <td className={styles.centerAlign}>{item.representative_name}</td>
                      <td className={styles.centerAlign}>{formatPhoneNumber(item.tell_number)}</td>
                      <td className={styles.centerAlign}>{formatPhoneNumber(item.fax_number)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noResult}>
                      검색 결과가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
            >
              이전
            </button>
            <span className={styles.pageInfo}>
              {page} / {totalPages}
            </span>
            <button
              className={styles.paginationButton}
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
