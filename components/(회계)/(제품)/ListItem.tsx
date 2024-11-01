'use client';

import Spinner from '@/components/ETC/Spinner/Spinner';
import styles from '@/styles/ListItem.module.css';
import { appendParticle, formatPrice, numberToKorean } from '@/util/reform';
import useThrottle from '@/util/useThrottle';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Switch from 'react-switch';
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
  const [newData, setNewData] = useState<Product[] | null>(null);

  // 각 아이템의 높이를 설정
  const itemHeight = 55;

  // 헤더, 푸터 등의 고정된 요소의 높이를 설정
  const fixedHeight = 400;

  // 최소 및 최대 페이지 사이즈를 설정
  const MIN_PAGE_SIZE = 5;
  const MAX_PAGE_SIZE = 20;

  // 페이지 사이즈를 동적으로 계산하는 함수
  const calculatePageSize = (screenHeight: number): number => {
    const availableHeight = screenHeight - fixedHeight;
    let newPageSize = Math.floor(availableHeight / itemHeight);
    return Math.max(MIN_PAGE_SIZE, Math.min(newPageSize, MAX_PAGE_SIZE));
  };

  // pageSize의 초기값을 null로 설정
  const [pageSize, setPageSize] = useState<number | null>(null);

  // 컴포넌트 마운트 시 정확한 pageSize 계산
  useEffect(() => {
    const screenHeight = window.innerHeight;
    const newPageSize = calculatePageSize(screenHeight);
    setPageSize(newPageSize);
  }, []);

  // Throttle을 사용하여 handleResize 함수 최적화
  const handleResize = useThrottle(() => {
    const screenHeight = window.innerHeight;
    const newPageSize = calculatePageSize(screenHeight);
    const newTotalPages = Math.max(Math.ceil(total / newPageSize), 1);

    setPageSize((prevPageSize) => {
      if (prevPageSize !== newPageSize) {
        setTriggerSearch((prev) => !prev);
        if (page > newTotalPages) {
          setPage(newTotalPages);
        }
        return newPageSize;
      }
      return prevPageSize;
    });

    if (newTotalPages === 1) {
      setPage(1);
    }

    // 창 크기가 변경되면 페이지 이동 모달을 닫고 다시 열기
    if (Swal.isVisible() && Swal.getTitle()?.textContent?.startsWith('이동할')) {
      Swal.close();
      if (newTotalPages > 1) {
        handlePageJump(newTotalPages);
      }
    }
  }, 1000); // 1초 간격으로 실행

  // 창 크기 조정 이벤트를 등록
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 상세 페이지로 이동하는 함수
  function editRoute(product_id: string, isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popupWindow = window.open(
        `/items-edit/${product_id}`,
        `editPopup-${product_id}`,
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = `editPopup-${product_id}`;
      }
    } else {
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

  // totalPages 계산 함수
  const calculateTotalPages = (): number => {
    if (pageSize === null) return 1;
    return Math.max(Math.ceil(total / pageSize), 1);
  };

  const totalPages = calculateTotalPages();

  // 페이지 번호를 입력받아 해당 페이지로 이동하는 함수
  function handlePageJump(currentTotalPages: number) {
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

  // 토글 스위치를 눌렀을 때 모달을 띄우고 상태를 반전시킬지 묻는 로직
  const handleToggle = async (item: Product, checked: boolean) => {
    Swal.fire({
      title: `${item.product_name}의 사용 여부 변경`,
      text: checked
        ? `${appendParticle(item.product_name)} 사용하시겠습니까?`
        : `${item.product_name}의 사용을 중지하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: checked ? `사용하겠습니다.` : `중지하겠습니다.`,
      cancelButtonText: '취소',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newItem = {
          ...item,
          is_use: checked ? '사용' : '중지',
        };

        try {
          // 클라이언트에서 직접 API 호출
          const res = await fetch(`/api/itemUpdate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
            credentials: 'include',
          });

          if (res.ok) {
            Swal.fire({
              title: '성공',
              text: checked
                ? `이제 ${appendParticle(item.product_name)} 사용합니다.`
                : `${item.product_name}의 사용을 중지합니다.`,
              icon: 'success',
              showConfirmButton: false,
              timer: 1250,
            });
            localStorage.setItem('reloadProductItems', new Date().toString());
            setTriggerSearch((prev) => !prev);
          } else {
            const errorData = await res.json();
            Swal.fire('오류', errorData.message || '제품 수정에 실패하였습니다.', 'error');
          }
        } catch (error) {
          console.error('API 요청 중 에러 발생:', error);
          Swal.fire('오류', 'API 요청 중 에러가 발생했습니다.', 'error');
        }
      }
    });
  };

  // 데이터 Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/itemListData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
          setNewData(result.data); // 새 데이터를 임시로 저장
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
  }, [triggerSearch, page, sortColumn, sortOrder, pageSize]);

  useEffect(() => {
    if (!isLoading && newData) {
      setData(newData); // 로딩이 끝나면 기존 데이터를 새 데이터로 교체
      setNewData(null);
    }
  }, [isLoading, newData]);

  if (pageSize === null) {
    // pageSize가 설정되기 전에는 로딩 상태를 표시
    return <Spinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead className={styles.tableHeader}>
            <tr>
              <th onClick={() => handleSort('product_name')}>
                <span className={styles.headerCell}>
                  <span className={styles.fakeLabel}>▲</span>
                  제품명
                  <span className={styles.sortArrow}>
                    {sortColumn === 'product_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </span>
                </span>
              </th>
              <th onClick={() => handleSort('category')}>
                <span className={styles.headerCell}>
                  <span className={styles.fakeLabel}>▲</span>
                  카테고리
                  <span className={styles.sortArrow}>
                    {sortColumn === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </span>
                </span>
              </th>
              <th onClick={() => handleSort('price')}>
                <span className={styles.headerCell}>
                  <span className={styles.fakeLabel}>▲</span>
                  가격
                  <span className={styles.sortArrow}>
                    {sortColumn === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </span>
                </span>
              </th>
              <th onClick={() => handleSort('manufacturer')}>
                <span className={styles.headerCell}>
                  <span className={styles.fakeLabel}>▲</span>
                  제조업체
                  <span className={styles.sortArrow}>
                    {sortColumn === 'manufacturer' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </span>
                </span>
              </th>
              <th onClick={() => handleSort('is_use')}>
                <span className={styles.headerCell}>
                  <span className={styles.fakeLabel}>▲</span>
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
                <tr key={item.product_id} className={styles.tableRow}>
                  <td
                    className={styles.centerAlign}
                    onClick={(event) => {
                      editRoute(item.product_id, event.ctrlKey || event.metaKey);
                    }}
                    title={item.description}
                  >
                    {item.product_name}
                  </td>
                  <td
                    className={styles.centerAlign}
                    onClick={(event) => {
                      editRoute(item.product_id, event.ctrlKey || event.metaKey);
                    }}
                    title={item.description}
                  >
                    {item.category || '없음'}
                  </td>
                  <td
                    className={styles.rightAlign}
                    onClick={(event) => {
                      editRoute(item.product_id, event.ctrlKey || event.metaKey);
                    }}
                    title={`${numberToKorean(item.price)}원정`}
                  >
                    {item.price === null || item.price === undefined ? '0원' : `${formatPrice(item.price)}원`}
                  </td>
                  <td
                    className={styles.leftAlign}
                    onClick={(event) => {
                      editRoute(item.product_id, event.ctrlKey || event.metaKey);
                    }}
                    title={item.manufacturer}
                  >
                    {item.manufacturer || '없음'}
                  </td>
                  <td className={styles.centerAlign} title={item.is_use}>
                    <Switch
                      onChange={(checked) => handleToggle(item, checked)}
                      checked={item.is_use === '사용'}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onColor="#499eff"
                      offColor="#ccc"
                    />
                  </td>
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
        {totalPages !== 1 && <button className={styles.fakeButton}>이거는 가짜</button>}
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
          <button className={styles.paginationButton} onClick={() => handlePageJump(totalPages)}>
            페이지 이동
          </button>
        )}
      </div>
    </div>
  );
}
