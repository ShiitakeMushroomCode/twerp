import styles from '@/styles/ListItem.module.css';

interface TableHeaderProps {
  sortColumn: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: string) => void;
}

export default function TableHeader({ sortColumn, sortOrder, handleSort }: TableHeaderProps) {
  return (
    <thead className={styles.tableHeader}>
      <tr>
        <th>복사</th>
        <th onClick={() => handleSort('sale_date')}>
          <span className={styles.headerCell} title="거래일자">
            <span className={styles.fakeLabel}>▲</span>
            거래일자
            <span className={styles.sortArrow}>{sortColumn === 'sale_date' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
          </span>
        </th>
        <th onClick={() => handleSort('company_name')}>
          <span className={styles.headerCell} title="거래처명">
            <span className={styles.fakeLabel}>▲</span>
            거래처명
            <span className={styles.sortArrow}>
              {sortColumn === 'company_name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th onClick={() => handleSort('item_names')}>
          <span className={styles.headerCell} title="품목명">
            <span className={styles.fakeLabel}>▲</span>
            품목명
            <span className={styles.sortArrow}>{sortColumn === 'item_names' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
          </span>
        </th>
        <th onClick={() => handleSort('total_amount')}>
          <span className={styles.headerCell} title="금액 합계">
            <span className={styles.fakeLabel}>▲</span>
            금액 합계
            <span className={styles.sortArrow}>
              {sortColumn === 'total_amount' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th title="거래명세표 인쇄">거래명세표</th>
        <th title="회계 반영 여부">회계 반영</th>
      </tr>
    </thead>
  );
}
