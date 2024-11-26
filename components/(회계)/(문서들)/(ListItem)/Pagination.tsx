import styles from '@/styles/ListItem.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  handlePageJump: (totalPages: number) => void;
}

export default function Pagination({ page, totalPages, setPage, handlePageJump }: PaginationProps) {
  return (
    <div className={styles.pagination}>
      {totalPages !== 1 && <button className={styles.fakeButton}>이거는 가짜</button>}
      <button className={styles.paginationButton} onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>
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
            handlePageJump(totalPages);
          }}
          disabled={totalPages === 1}
        >
          페이지 이동
        </button>
      )}
    </div>
  );
}
