import styles from '@/styles/ListItem.module.css';
import { formatDateWithSequence, formatPrice, numberToKorean } from '@/util/reform';
import { FiCopy, FiPrinter } from 'react-icons/fi';
import { SaleData } from './PurchaseListItem';

interface TableRowProps {
  item: SaleData;
  editRoute: (sales_id: string, isNewTab: boolean) => void;
  addRoute: (sales_id: string, isNewTab: boolean) => void;
  handlePrint: (sales_id: string) => void;
}

export default function TableRow({ item, editRoute, addRoute, handlePrint }: TableRowProps) {
  const firstItemName = item.item_names[0];
  const remainingItemsCount = item.item_names.length - 1;
  const formattedDate = formatDateWithSequence(item.sale_date, item.sequence_number);

  return (
    <tr key={item.sales_id} className={styles.tableRow} title={item.description || ''}>
      <td
        className={styles.centerAlign}
        onClick={(event) => {
          addRoute(item.sales_id, event.ctrlKey || event.metaKey);
        }}
      >
        <span className={styles.iconButton}>
          <FiCopy />
          복사
        </span>
      </td>
      <td
        className={styles.centerAlign}
        onClick={(event) => {
          editRoute(item.sales_id, event.ctrlKey || event.metaKey);
        }}
      >
        {formattedDate}
      </td>
      <td
        className={styles.leftAlign}
        onClick={(event) => {
          editRoute(item.sales_id, event.ctrlKey || event.metaKey);
        }}
        title={item.company_name}
      >
        {item.company_name}
      </td>
      <td
        className={styles.leftAlign}
        onClick={(event) => {
          editRoute(item.sales_id, event.ctrlKey || event.metaKey);
        }}
        title={`${firstItemName}${
          remainingItemsCount > 0 ? ` 외 ${remainingItemsCount}건\n${item.item_names.join(', ')}` : ``
        }`}
      >
        {firstItemName}
        {remainingItemsCount > 0 && ` 외 ${remainingItemsCount}건`}
      </td>
      <td
        className={styles.rightAlign}
        onClick={(event) => {
          editRoute(item.sales_id, event.ctrlKey || event.metaKey);
        }}
        title={`${numberToKorean(item.total_amount)}원정`}
      >
        {formatPrice(item.total_amount)}원
      </td>
      <td
        className={styles.centerAlign}
        onClick={(e) => {
          e.stopPropagation();
          handlePrint(item.sales_id);
        }}
      >
        <span className={styles.iconButton}>
          <FiPrinter />
          인쇄
        </span>
      </td>
      <td className={styles.centerAlign}>
        <span
          className={styles.iconButton}
          style={{
            color: item.collection === '진행중' ? '#f39c12' : '#239050',
            fontWeight: item.collection === '진행중' ? 'bold' : 'normal',
          }}
        >
          {item.collection}
        </span>
      </td>
    </tr>
  );
}
