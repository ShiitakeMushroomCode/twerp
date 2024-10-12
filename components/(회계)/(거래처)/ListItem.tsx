'use client';

import styles from '@/styles/ListItem.module.css';
import { useEffect, useState } from 'react';

interface Company {
  business_number: string;
  company_id: string;
  company_name: string;
  is_registered: boolean;
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
  const pageSize = 15;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm, page, pageSize }),
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
  }, [triggerSearch, page, searchTerm]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <p className={styles.loading}>로딩 중...</p>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: '23%' }} />
                <col style={{ width: '61%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>사업자번호</th>
                  <th>기업명</th>
                  <th>등록정보</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.company_id} className={styles.tableRow}>
                      <td className={styles.centerAlign}>
                        {item.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
                      </td>
                      <td>
                        <span className={styles.company_name}>{item.company_name}</span>
                      </td>
                      <td className={styles.centerAlign}>{item.is_registered ? '등록' : '미등록'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={styles.noResult}>
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
