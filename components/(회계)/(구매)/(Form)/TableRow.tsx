import { isEmpty } from '@/util/lo';
import { numberToKorean } from '@/util/reform';
import { Dispatch, SetStateAction } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Row } from './SalesForm';
import styles from './SalesForm.module.css';

interface TableRowProps {
  index: number;
  row: Row;
  handleProductSelect: (index: number) => void;
  handleInputChange: (index: number, field: string, value: string) => void;
  isSearch: boolean;
  setRows: Dispatch<SetStateAction<Row[]>>;
  formatNumber: (value: string) => string;
}

export default function TableRow({
  index,
  row,
  handleProductSelect,
  handleInputChange,
  isSearch,
  setRows,
  formatNumber,
}: TableRowProps) {
  return (
    <tr key={index} className={styles.row}>
      <td className={styles.cell}>
        <input
          type="checkbox"
          name={`checkbox_${index}`}
          className={styles.checkbox}
          checked={row.selected}
          onChange={(e) => {
            setRows((prevRows) => {
              const updatedRows = [...prevRows];
              updatedRows[index] = { ...updatedRows[index], selected: e.target.checked };
              return updatedRows;
            });
          }}
          disabled={isSearch}
        />
      </td>
      <td className={styles.cell}>
        <div className={styles.productNameContainer}>
          <button
            type="button"
            className={styles.searchButton}
            disabled={isSearch}
            onClick={() => handleProductSelect(index)}
          >
            <FiSearch />
          </button>
          <input
            className={`${styles.tableInput} ${styles.centerAlign}`}
            type="text"
            name={`product_name_${index}`}
            value={row.product_name}
            onChange={(e) => handleInputChange(index, 'product_name', e.target.value)}
            autoComplete="off"
            disabled={isSearch}
            title={row.product_name}
          />
        </div>
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.centerAlign}`}
          type="text"
          name={`standard_${index}`}
          value={row.standard}
          onChange={(e) => handleInputChange(index, 'standard', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={row.standard}
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.centerAlign}`}
          type="text"
          name={`quantity_${index}`}
          value={formatNumber(row.quantity.toString())}
          onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={
            !isEmpty(row.quantity)
              ? `${formatNumber(row.quantity.toString())}${row.unit}\n${numberToKorean(row.quantity)}${row.unit}`
              : undefined
          }
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.centerAlign}`}
          type="text"
          name={`unit_${index}`}
          value={row.unit}
          onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={row.unit}
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.rightAlign}`}
          type="text"
          name={`price_${index}`}
          value={formatNumber(row.price.toString())}
          onChange={(e) => handleInputChange(index, 'price', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={!isEmpty(row.price) ? `\\${formatNumber(row.price.toString())}\n${numberToKorean(row.price)}원정` : undefined}
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.rightAlign}`}
          type="text"
          name={`supply_amount_${index}`}
          readOnly
          value={formatNumber(row.supply_amount.toString())}
          autoComplete="off"
          disabled={isSearch}
          title={
            !isEmpty(row.supply_amount)
              ? `\\${formatNumber(row.supply_amount.toString())}\n${numberToKorean(row.supply_amount)}원정`
              : undefined
          }
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.rightAlign}`}
          type="text"
          name={`sub_price_${index}`}
          value={formatNumber(row.sub_price.toString())}
          onChange={(e) => handleInputChange(index, 'sub_price', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={
            !isEmpty(row.sub_price)
              ? `\\${formatNumber(row.sub_price.toString())}\n${numberToKorean(row.sub_price)}원정`
              : undefined
          }
        />
      </td>
      <td className={styles.cell}>
        <input
          className={`${styles.tableInput} ${styles.leftAlign}`}
          type="text"
          name={`description_${index}`}
          value={row.description}
          onChange={(e) => handleInputChange(index, 'description', e.target.value)}
          autoComplete="off"
          disabled={isSearch}
          title={row.description}
        />
      </td>
    </tr>
  );
}
