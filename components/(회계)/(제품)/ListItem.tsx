'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
import styles from '@/styles/ListItem.module.css';
import { formatPrice } from '@/util/reform';
import useDebounce from '@/util/useDebounce';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

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
    return 15;
  };

  const [pageSize, setPageSize] = useState<number>(getInitialPageSize);

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
        setTriggerSearch((prev) => !prev);
        return newPageSize;
      }
      return prevPageSize;
    });

    // 창 크기가 변경되면 팝업 닫기
    if (Swal.isVisible()) {
      Swal.close();

      let currentTotalPages = Math.max(Math.ceil(total / newPageSize), 1); // 초기 totalPages 계산
      if (currentTotalPages > 1) {
        handlePageJump(currentTotalPages);
      }
    }
  }, 300);

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  function editRoute(product_id: string, isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popupWindow = window.open(
        `/items-edit/${product_id}`,
        'editClientPopup',
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = 'editClientPopup';
      }
    } else {
      router.push(`/items-edit/${product_id}`);
    }
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setPage(1);
  }

  useEffect(() => {
    if (pageSize === null) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requestBody: any = {
          searchTerm,
          page,
          pageSize,
        };

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

  const calculateTotalPages = () => {
    return Math.max(Math.ceil(total / pageSize), 1);
  };
  const totalPages = calculateTotalPages();

  function handlePageJump(currentTotalPages) {
    // SweetAlert2 팝업을 엽니다
    Swal.fire({
      title: `이동할 페이지 번호를 입력하세요 (1 ~ ${currentTotalPages})`,
      input: 'number',
      inputAttributes: {
        min: '1',
        step: '1',
        max: currentTotalPages.toString(),
        placeholder: `페이지 번호는 1에서 ${currentTotalPages} 사이여야 합니다.`,
      },
      showCancelButton: true,
      confirmButtonText: '이동',
      cancelButtonText: '취소',
      preConfirm: (pageNumber) => {
        const pageNum = Number(pageNumber);
        if (pageNum < 1 || pageNum > currentTotalPages || isNaN(pageNum)) {
          Swal.showValidationMessage(`페이지 번호는 1에서 ${currentTotalPages} 사이여야 합니다.`);
          return false;
        }
        return pageNum;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setPage(result.value); // 사용자가 입력한 페이지로 이동
      }
    });
  }

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
                      <span className={styles.sortArrow}>
                        {sortColumn === 'product_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('category')}>
                    <span className={styles.headerCell}>
                      카테고리
                      <span className={styles.sortArrow}>
                        {sortColumn === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('price')}>
                    <span className={styles.headerCell}>
                      가격
                      <span className={styles.sortArrow}>
                        {sortColumn === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('manufacturer')}>
                    <span className={styles.headerCell}>
                      제조업체
                      <span className={styles.sortArrow}>
                        {sortColumn === 'manufacturer' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </span>
                  </th>
                  <th onClick={() => handleSort('is_use')}>
                    <span className={styles.headerCell}>
                      사용 여부
                      <span className={styles.sortArrow}>
                        {sortColumn === 'is_use' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
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
            {totalPages !== 1 && <button className={styles.fakeButton}>이건 가짜지</button>}
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
            {totalPages !== 1 && (
              <button
                className={styles.paginationButton}
                onClick={() => {
                  handlePageJump(calculateTotalPages());
                }}
                disabled={totalPages === 1}
              >
                페이지 이동
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
