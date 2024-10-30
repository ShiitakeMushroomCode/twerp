'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
import styles from '@/styles/ListItem.module.css';
import { formatPhoneNumber } from '@/util/reform';
import useDebounce from '@/util/useDebounce';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface Company {
  business_number: string;
  company_id: string;
  company_name: string;
  is_registered: boolean;
  clients_id: string;
  representative_name: string;
  tell_number: string;
  fax_number: string;
  description: string;
}

interface ListItemProps {
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
  triggerSearch: boolean;
  setTriggerSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CompanyListItem({ searchTerm, page, setPage, triggerSearch, setTriggerSearch }: ListItemProps) {
  const router = useRouter();
  const [data, setData] = useState<Company[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('company_name');
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

    // 창 크기가 변경되면 팝업 닫기
    if (Swal.isVisible()) {
      Swal.close();

      let currentTotalPages = Math.max(Math.ceil(total / newPageSize), 1); // 초기 totalPages 계산
      if (currentTotalPages > 1) {
        // SweetAlert2 팝업을 엽니다
        handlePageJump(currentTotalPages);
      }
    }
  }, 300); // 300ms 지연

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  // 상세 페이지로 이동하는 함수
  function editRoute(clients_id: string, isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popupWindow = window.open(
        `/client-edit/${clients_id}`,
        'editClientPopup',
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = 'editClientPopup';
      }
    } else {
      router.push(`/client-edit/${clients_id}`);
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

  // totalPages 계산 함수
  const calculateTotalPages = () => {
    return Math.max(Math.ceil(total / pageSize), 1);
  };

  // 페이지 번호를 입력받아 해당 페이지로 이동하는 함수
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

  // 데이터 Fetch
  useEffect(() => {
    if (pageSize === null) return; // pageSize가 설정되기 전에는 데이터를 가져오지 않음

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
        console.error('데이터를 가져오는데 실패하였습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [triggerSearch, page, searchTerm, sortColumn, sortOrder, pageSize]);

  const totalPages = calculateTotalPages();

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
                      onClick={(event) => {
                        editRoute(item.clients_id, event.ctrlKey || event.metaKey);
                      }}
                      title={item.description}
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
