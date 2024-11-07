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
            <span className={styles.sortArrow}>{sortColumn === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
          </span>
        </th>
        <th onClick={() => handleSort('price')}>
          <span className={styles.headerCell}>
            <span className={styles.fakeLabel}>▲</span>
            가격
            <span className={styles.sortArrow}>{sortColumn === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
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
            <span className={styles.sortArrow}>{sortColumn === 'is_use' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
          </span>
        </th>
      </tr>
    </thead>
  );
}
