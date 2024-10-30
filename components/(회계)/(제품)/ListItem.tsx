'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
import styles from '@/styles/ListItem.module.css';
import { formatPrice } from '@/util/reform';
import useDebounce from '@/util/useDebounce';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  setTriggerSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProductListItem({ searchTerm, page, setPage, triggerSearch, setTriggerSearch }: ListItemProps) {
  const router = useRouter();
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('product_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 초기 pageSize를 화면 크기에 따라 설정하는 함수
  const getInitialPageSize = () => {
    if (typeof window !== 'undefined') {
      const screenHeight = window.innerHeight;
      let newPageSize: number;

      if (screenHeight >= 1440) {
        newPageSize = 20;
      } else if (screenHeight <= 720) {
        newPageSize = 5;
      } else if (screenHeight <= 1080) {
        newPageSize = 9;
      } else {
        newPageSize = 15;
      }
      return newPageSize;
    }
    return 15; // 서버 사이드 렌더링 시 기본값
  };

  const [pageSize, setPageSize] = useState<number>(getInitialPageSize);

  // Debounce를 사용하여 handleResize 함수 최적화
  const debouncedHandleResize = useDebounce(() => {
    const screenHeight = window.innerHeight;
    let newPageSize: number;

    if (screenHeight >= 1440) {
      newPageSize = 20;
    } else if (screenHeight <= 720) {
      newPageSize = 5;
    } else if (screenHeight <= 1080) {
      newPageSize = 9;
    } else {
      newPageSize = 15;
    }

    setPageSize((prevPageSize) => {
      if (prevPageSize !== newPageSize) {
        setTriggerSearch((prev) => !prev); // 검색 트리거 토글
        return newPageSize;
      }
      return prevPageSize;
    });
  }, 300); // 300ms 지연

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  // 제품 수정 페이지로 이동하는 함수
  function editRoute(product_id: string, isNewTab: boolean) {
    if (isNewTab) {
      // 팝업 창 크기와 위치 설정 (예: 600x400 크기의 창, 중앙에 열기)
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      // 새 창을 팝업처럼 열고, 이름을 'editClientPopup'으로 설정
      const popupWindow = window.open(
        `/items-edit/${product_id}`,
        'editClientPopup', // 창의 이름
        `width=${width},height=${height},top=${top},left=${left}`
      );

      // 새 창을 열었을 때 그 창이 최상위로 뜨도록 처리
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = 'editClientPopup';
      }
    } else {
      // 기존 탭에서 이동
      router.push(`/items-edit/${product_id}`);
    }
  }

  // 정렬을 처리하는 함수
  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setPage(1); // 정렬 변경 시 페이지를 첫 번째 페이지로 리셋
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
    if (pageSize === null) return; // pageSize가 설정되기 전에는 데이터를 가져오지 않음

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
                      onClick={(event) => {
                        editRoute(item.product_id, event.ctrlKey || event.metaKey);
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
