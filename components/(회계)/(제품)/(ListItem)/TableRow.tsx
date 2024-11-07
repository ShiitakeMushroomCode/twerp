import { Product } from '@/components/(회계)/(제품)/(ListItem)/ProductListItem';
import styles from '@/styles/ListItem.module.css';
import { formatPrice, numberToKorean } from '@/util/reform';
import Switch from 'react-switch';

interface TableRowProps {
  item: Product;
  editRoute: (product_id: string, isNewTab: boolean) => void;
  handleToggle: (item: Product, checked: boolean) => void;
}

export default function TableRow({ item, editRoute, handleToggle }: TableRowProps) {
  return (
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
          id={`${item.product_id}-switch`}
          name="switch"
        />
      </td>
    </tr>
  );
}
