'use client';
import Spinner from '@/components/ETC/Spinner/Spinner';
import styles from '@/styles/ListItem.module.css';
import useThrottle from '@/util/useThrottle';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import Pagination from './Pagination';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export interface SaleData {
  sales_id: string;
  company_name: string;
  item_names: string[];
  total_amount: number;
  transaction_type: string;
  description: string | null;
  sale_date: string;
  update_at: string;
  sequence_number: number;
  collection: string;
}

interface ListItemProps {
  searchTerm: string;
  searchOptions: any;
  page: number;
  setPage: (page: number) => void;
  triggerSearch: boolean;
  setTriggerSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SalesListItem({
  searchTerm,
  searchOptions,
  page,
  setPage,
  triggerSearch,
  setTriggerSearch,
}: ListItemProps) {
  const router = useRouter();
  const [data, setData] = useState<SaleData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<string>('sale_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newData, setNewData] = useState<SaleData[] | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // 각 아이템의 높이를 설정
  const itemHeight = 45;

  // 헤더, 푸터 등의 고정된 요소의 높이를 설정
  const fixedHeight = 380;

  // 최소 및 최대 페이지 사이즈를 설정
  const MIN_PAGE_SIZE = 5;
  const MAX_PAGE_SIZE = 20;

  // 페이지 사이즈를 동적으로 계산하는 함수
  const calculatePageSize = (screenHeight: number) => {
    const availableHeight = screenHeight - fixedHeight;
    let newPageSize = Math.floor(availableHeight / itemHeight);
    return Math.max(MIN_PAGE_SIZE, Math.min(newPageSize, MAX_PAGE_SIZE));
  };

  // 인쇄
  const handlePrint = (sales_id: string) => {
    if (iframeRef.current) {
      // iframe에 다른 페이지 로드
      iframeRef.current.src = `/sales-print/${sales_id}`;

      // 페이지가 로드되면 인쇄 실행
      iframeRef.current.onload = () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.print();
        }
      };
    }
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
  }, 1000);

  // 창 크기 조정 이벤트를 등록
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너를 해제
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 상세 페이지로 이동하는 함수
  function editRoute(sales_id: string, isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popupWindow = window.open(
        `/sales-edit/${sales_id}`,
        `editPopup-${sales_id}`,
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = `editPopup-${sales_id}`;
      }
    } else {
      router.push(`/sales-edit/${sales_id}`);
    }
  }

  function addRoute(sales_id: string, isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popupWindow = window.open(
        `/sales-add/${sales_id}`,
        `editPopup-${sales_id}`,
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (popupWindow) {
        popupWindow.focus();
        popupWindow.name = `editPopup-${sales_id}`;
      }
    } else {
      router.push(`/sales-add/${sales_id}`);
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
    return Math.max(Math.ceil(total / (pageSize || MIN_PAGE_SIZE)), 1);
  };

  const totalPages = pageSize !== null ? calculateTotalPages() : 1;

  // 페이지 번호를 입력받아 해당 페이지로 이동하는 함수
  function handlePageJump(currentTotalPages: number) {
    Swal.fire({
      title: `이동할 페이지 번호를 입력하세요 (1 ~ ${currentTotalPages})`,
      input: 'number',
      inputAttributes: {
        min: '1',
        step: '1',
        max: currentTotalPages.toString(),
        placeholder: `페이지 번호는 1에서 ${currentTotalPages} 사이여야 합니다.`,
        autocomplete: 'off'
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
    if (pageSize !== null) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/salesListData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              searchTerm,
              searchOptions,
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
    }
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
            <col style={{ width: '8%' }} />
            <col style={{ width: '23%' }} />
            <col style={{ width: '23%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <TableHeader sortColumn={sortColumn} sortOrder={sortOrder} handleSort={handleSort} />
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow
                  key={item.sales_id}
                  item={item}
                  editRoute={editRoute}
                  addRoute={addRoute}
                  handlePrint={handlePrint}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.noResult}>
                  검색 결과가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} handlePageJump={handlePageJump} />
      <iframe ref={iframeRef} style={{ display: 'none' }} title="Print Frame"></iframe>
    </div>
  );
}
