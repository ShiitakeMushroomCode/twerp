import styles from '@/styles/ListItem.module.css';
import { formatPhoneNumber } from '@/util/reform';
import { Company } from './ClientListItem';

interface TableRowProps {
  item: Company;
  editRoute: (clients_id: string, isNewTab: boolean) => void;
}

export default function TableRow({ item, editRoute }: TableRowProps) {
  return (
    <tr
      key={item.clients_id}
      className={styles.tableRow}
      onClick={(event) => {
        editRoute(item.clients_id, event.ctrlKey || event.metaKey);
      }}
      title={item.description}
    >
      <td className={styles.centerAlign}>{item.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</td>
      <td className={styles.leftAlign} title={item.company_name}>
        {item.company_name}
      </td>
      <td className={styles.centerAlign}>{item.representative_name}</td>
      <td className={styles.centerAlign}>{formatPhoneNumber(item.tell_number)}</td>
      <td className={styles.centerAlign}>{formatPhoneNumber(item.fax_number)}</td>
    </tr>
  );
}
