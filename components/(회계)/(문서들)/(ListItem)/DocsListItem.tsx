import Pagination from '@/components/(회계)/(문서들)/(ListItem)/Pagination';
import styles from '@/styles/ListItem.module.css';

export default function DocsListItem() {
  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}></table>
        <Pagination page={1} totalPages={5} setPage={null} handlePageJump={null} />
      </div>
    </div>
  );
}
