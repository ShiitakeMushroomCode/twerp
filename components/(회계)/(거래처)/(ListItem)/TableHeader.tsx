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
        <th onClick={() => handleSort('business_number')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            사업자번호
            <span className={styles.sortArrow}>
              {sortColumn === 'business_number' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th onClick={() => handleSort('company_name')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            기업명
            <span className={styles.sortArrow}>
              {sortColumn === 'company_name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th onClick={() => handleSort('representative_name')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            대표자명
            <span className={styles.sortArrow}>
              {sortColumn === 'representative_name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th onClick={() => handleSort('tell_number')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            대표번호
            <span className={styles.sortArrow}>
              {sortColumn === 'tell_number' && (sortOrder === 'asc' ? '▲' : '▼')}
            </span>
          </span>
        </th>
        <th onClick={() => handleSort('fax_number')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            팩스번호
            <span className={styles.sortArrow}>{sortColumn === 'fax_number' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
          </span>
        </th>
      </tr>
    </thead>
  );
}
