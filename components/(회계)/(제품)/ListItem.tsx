'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
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
  description: string;
}

interface ListItemProps {
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
  triggerSearch: boolean;
  setTriggerSearch: any;
}

export default function ListItem({ searchTerm, page, setPage, triggerSearch, setTriggerSearch }: ListItemProps) {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('product_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(15);
  const router = useRouter();

  useEffect(() => {
    // 화면 크기에 따라 값이 변경되도록 함수 정의
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth >= 2560) {
        // 4K 이상 해상도일 때
        setPageSize(20);
      } else if (screenWidth <= 1280) {
        // HD 이하 해상도일 때
        setPageSize(5);
      } else if (screenWidth <= 1920) {
        // FHD 이하 해상도일 때
        setPageSize(9);
      } else {
        // FHD 초과 ~ 2560px 미만일 때
        setPageSize(15);
      }

      setTriggerSearch((prev) => !prev); // 검색 트리거 토글
    };

    // 컴포넌트가 마운트되면 리스너 추가 및 초기 화면 크기 설정
    handleResize();
    window.addEventListener('resize', handleResize);

    // 컴포넌트가 언마운트될 때 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // 제품 수정 페이지로 이동하는 함수
  function editRoute(product_id: string) {
    router.push(`/items-edit/${product_id}`);
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

  // 정렬 화살표를 렌더링하는 함수
  function renderSortArrow(column: string) {
    if (sortColumn === column) {
      return sortOrder === 'asc' ? '▲' : '▼';
    } else {
      return ''; // 화살표 공간을 확보하기 위해 빈 문자열 반환
    }
  }

  // 데이터 Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requestBody: any = {
          searchTerm,
          page,
          pageSize,
        };

        // 정렬 조건이 있을 때만 포함
        if (sortColumn) {
          requestBody.sortColumn = sortColumn;
          requestBody.sortOrder = sortOrder;
        }

        const response = await fetch(`/api/itemListData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (Array.isArray(result.data)) {
          setData(result.data);
          setTotal(result.total);
        } else {
          console.error('데이터 형식이 올바르지 않습니다:', result);
        }
      } catch (error) {
        console.error('데이터를 가져오는데 실패하였습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [triggerSearch, page, searchTerm, sortColumn, sortOrder, pageSize]);

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
                <col style={{ width: '22%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead className={styles.tableHeader}>
                <tr>
                  <th onClick={() => handleSort('product_name')}>
                    <span className={styles.headerCell}>
                      제품명
                      <span className={styles.sortArrow}>{renderSortArrow('product_name')}</span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('category')}>
                    <span className={styles.headerCell}>
                      카테고리
                      <span className={styles.sortArrow}>{renderSortArrow('category')}</span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('price')}>
                    <span className={styles.headerCell}>
                      가격
                      <span className={styles.sortArrow}>{renderSortArrow('price')}</span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('manufacturer')}>
                    <span className={styles.headerCell}>
                      제조업체
                      <span className={styles.sortArrow}>{renderSortArrow('manufacturer')}</span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('is_use')}>
                    <span className={styles.headerCell}>
                      사용 여부
                      <span className={styles.sortArrow}>{renderSortArrow('is_use')}</span>
                    </span>
                  </th>
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
                      title={item.description}
                    >
                      <td className={styles.centerAlign}>{item.product_name}</td>
                      <td className={styles.centerAlign}>{item.category || '없음'}</td>
                      <td className={styles.rightAlign}>
                        {item.price === null || item.price === undefined ? 0 : formatPrice(item.price) + '원'}
                      </td>
                      <td className={styles.centerAlign}>{item.manufacturer || '없음'}</td>
                      <td className={styles.centerAlign}>{item.is_use}</td>
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
