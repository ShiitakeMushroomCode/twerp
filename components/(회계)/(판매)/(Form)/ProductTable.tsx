import { numberToKorean } from '@/util/reform';
import { Dispatch, SetStateAction } from 'react';
import { Row } from './SalesForm';
import styles from './SalesForm.module.css';
import TableRow from './TableRow';

interface ProductTableProps {
  rows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  isSearch: boolean;
  handleProductSelect: (index: number) => void;
  handleInputChange: (index: number, field: string, value: string) => void;
  totalSupplyAmount: number;
  totalSubPrice: number;
  totalAmount: number;
  handleAddRow: () => void;
  handleDeleteSelectedRows: () => void;
  allChecked: boolean;
  setAllChecked: Dispatch<SetStateAction<boolean>>;
  formatNumber: (value: string) => string;
  handleSaveButton: () => Promise<void>;
}

export default function ProductTable({
  rows,
  setRows,
  isSearch,
  handleProductSelect,
  handleInputChange,
  totalSupplyAmount,
  totalSubPrice,
  totalAmount,
  handleAddRow,
  handleDeleteSelectedRows,
  allChecked,
  setAllChecked,
  formatNumber,
  handleSaveButton,
}: ProductTableProps) {
  return (
    <table className={styles.table}>
      <colgroup>
        <col style={{ width: '4%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '13%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '10%' }} />
        <col style={{ width: '10%' }} />
      </colgroup>
      <thead className={styles.tableHead}>
        <tr>
          <th className={styles.headerCell}>
            <input
              type="checkbox"
              id="allCheckBox"
              checked={allChecked}
              className={styles.checkbox}
              onChange={(e) => {
                setRows((prevRows) =>
                  prevRows.map((row) => ({
                    ...row,
                    selected: e.target.checked,
                  }))
                );
                setAllChecked(e.target.checked);
              }}
            />
          </th>
          <th className={styles.headerCell}>제품명</th>
          <th className={styles.headerCell}>규격</th>
          <th className={styles.headerCell}>수량</th>
          <th className={styles.headerCell}>단위</th>
          <th className={styles.headerCell}>단가</th>
          <th className={styles.headerCell}>공급가액</th>
          <th className={styles.headerCell}>부가세</th>
          <th className={styles.headerCell}>적요</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <TableRow
            key={index}
            index={index}
            row={row}
            handleProductSelect={handleProductSelect}
            handleInputChange={handleInputChange}
            isSearch={isSearch}
            setRows={setRows}
            formatNumber={formatNumber}
          />
        ))}

        {/* 총합계 표시 */}
        <tr className={styles.row}>
          <td className={styles.rcell} colSpan={9}>
            <div className={styles.resultContainer}>
              <div className={styles.results}>
                <span className={styles.resultTitle}>공급가액</span>
                <span
                  className={styles.resultValue}
                  title={`\\${totalSupplyAmount.toLocaleString()}\n${numberToKorean(totalSupplyAmount)}원정`}
                >
                  \{totalSupplyAmount.toLocaleString()}
                </span>
              </div>
              <div className={styles.results}>
                <span className={styles.resultTitle}>부가세</span>
                <span
                  className={styles.resultValue}
                  title={`\\${totalSubPrice.toLocaleString()}\n${numberToKorean(totalSubPrice)}원정`}
                >
                  \{totalSubPrice.toLocaleString()}
                </span>
              </div>
              <div className={styles.results}>
                <span className={styles.resultTitle}>총액</span>
                <span
                  className={styles.resultValue}
                  title={`\\${totalAmount.toLocaleString()}\n${numberToKorean(totalAmount)}원정`}
                >
                  \{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </td>
        </tr>
        {/* 버튼 영역 */}
        <tr className={styles.row}>
          <td className={styles.rcell} colSpan={9}>
            <div className={styles.buttonContainer}>
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className={`${styles.addButton} ${styles.addRowButton}`}
                  disabled={isSearch}
                >
                  행 추가
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelectedRows}
                  className={`${styles.addButton} ${styles.deleteButton}`}
                  disabled={isSearch}
                >
                  선택 삭제
                </button>
              </div>
              <div className={styles.buttons}>
                <button
                  type="button"
                  onClick={handleSaveButton}
                  className={`${styles.addButton} ${styles.saveButton}`}
                  disabled={isSearch}
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // 저장 및 출력 로직 구현
                  }}
                  className={`${styles.addButton} ${styles.savePrintButton}`}
                  disabled={isSearch}
                >
                  저장 및 출력
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // 메일 보내기 로직 구현
                  }}
                  className={`${styles.addButton} ${styles.emailButton}`}
                  disabled={isSearch}
                >
                  메일 보내기
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
