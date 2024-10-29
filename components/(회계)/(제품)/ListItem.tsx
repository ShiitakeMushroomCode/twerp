'use client';

import { formatPrice } from '@/util/reform';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ListItem.module.css';

interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  manufacturer: string;
  is_use: string;
}

interface ListItemProps {
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
  triggerSearch: boolean;
}

export default function ListItem({ searchTerm, page, setPage, triggerSearch }: ListItemProps) {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageSize = 15;
  const router = useRouter();

  function editRoute(product_id: string) {
    router.push(`/product-edit/${product_id}`);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/itemListData`, {
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
                <col style={{ width: '20%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>제품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>제조업체</th>
                  <th>사용 여부</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={item.product_id}
                      className={styles.tableRow}
                      onClick={() => {
                        editRoute(item.product_id);
                      }}
                    >
                      <td className={styles.leftAlign}>{item.product_name}</td>
                      <td className={styles.centerAlign}>{item.category || 'N/A'}</td>
                      <td className={styles.rightAlign}>{formatPrice(item.price)}</td>
                      <td className={styles.centerAlign}>{item.manufacturer || 'N/A'}</td>
                      <td className={styles.centerAlign}>{item.is_use}</td>
                      <td className={styles.centerAlign}>
                        <button onClick={() => editRoute(item.product_id)}>수정</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.noResult}>
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
