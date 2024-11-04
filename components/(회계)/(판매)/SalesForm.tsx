'use client';
import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(판매)/Address';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { format } from 'date-fns';
import { ChangeEvent, FormEvent, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import styles from './SalesForm.module.css';

export default function SalesForm({ initialData, onSubmit, isEditMode = false }) {
  useUnsavedChangesWarning();
  type TransactionType = '카드결제' | '현금결제' | '계좌이체' | '기타';

  const [isSearch, setIsSearch] = useState(false);
  const [clientAddress, setClientAddress] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<TransactionType>('카드결제');

  const [formData, setFormData] = useState(() => ({
    company_id: '',
    sale_date: '',
    transaction_type: '카드결제',
    collection: '진행중',
    client_id: null,
    client_name: '',
    client_address: '',
    client_tel: '',
    client_fax: '',
    description: '',
    client_staff_name: '',
    client_staff_contact_info: '',
    sales_items: [],
  }));

  const rowSize = 8;

  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => ({
      id: Date.now() + Math.random(),
      cells: Array(rowSize).fill(''),
      selected: false,
    }))
  );

  const handleInputChange = (value, index, cellIndex) => {
    const updatedRows = [...rows];

    // 필터링: 숫자 필드일 경우 숫자만 허용
    if (['2', '4', '5', '6'].includes(cellIndex.toString())) {
      const filteredValue = value.replace(/(?!^-)[^0-9]/g, '').replace(/^-{2,}/, '-');
      updatedRows[index].cells[cellIndex] = filteredValue;
    } else {
      updatedRows[index].cells[cellIndex] = value;
    }

    setRows(updatedRows);
  };

  function handleDateChange(date: Date | null) {
    if (date) {
      setStartDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        sale_date: formattedDate,
      }));
    }
  }

  function handleTransactionTypeChange(e) {
    setTransactionType(e.target.value as TransactionType);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // 행 추가 핸들러
  const handleAddRow = () => {
    setRows([...rows, { id: Date.now() + Math.random(), cells: Array(rowSize).fill(''), selected: false }]);
  };

  const [allChecked, setAllChecked] = useState(false);
  // 선택 삭제 핸들러
  const handleDeleteSelectedRows = () => {
    let updatedRows = rows.filter((row) => !row.selected);

    // 최소 5개의 행이 유지되도록 빈 행 추가
    while (updatedRows.length < 5) {
      updatedRows.push({ id: Date.now() + Math.random(), cells: Array(rowSize).fill(''), selected: false });
    }

    setRows(updatedRows);
    setAllChecked(false);
  };

  // Submit 이벤트
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.title}>
        <span>{isEditMode ? '매출 정보 수정하기' : '매출 정보 추가하기'}</span>
        {isEditMode && (
          <button type="button" className={styles.delButton} onClick={() => {}} disabled={isSearch} title="제품 삭제">
            삭제
            <FaTrashAlt style={{ marginLeft: '0.5rem' }} />
          </button>
        )}
      </div>
      <div className={styles.subForm}>
        <div className={styles['form-row']}>
          <label htmlFor="client_name" className={styles.label}>
            거래처명
          </label>
          <button type="button" className={styles.searchButton}>
            <FiSearch />
          </button>
          <input
            id="client_name"
            name="client_name"
            type="text"
            className={styles.input}
            required
            autoComplete="off"
            value={formData.client_name}
            onChange={handleChange}
            disabled={isSearch}
          />
          <button
            type="button"
            className={styles.resetButton}
            disabled={isSearch}
            onClick={() => setFormData((prev) => ({ ...prev, client_name: '' }))}
          >
            초기화
          </button>
        </div>
        <div className={styles['form-row']}>
          <label htmlFor="sale_date" className={styles.label}>
            거래일자
          </label>
          <div className={styles.dateInput}>
            <DatePicker
              selectedDate={startDate}
              onDateChange={handleDateChange}
              disabled={isSearch}
              inputId="sale_date"
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5, 11, 31))}
            />
          </div>
          <button
            type="button"
            className={styles.resetButton}
            disabled={isSearch}
            onClick={() => setStartDate(new Date())}
          >
            초기화
          </button>
        </div>
        <div className={styles['form-row']}>
          <label htmlFor="client_address" className={styles.label}>
            주소
          </label>
          <input
            id="client_address"
            name="client_address"
            type="text"
            className={`${styles.input} ${styles.hover}`}
            autoComplete="off"
            value={clientAddress}
            title={clientAddress}
            readOnly
            onClick={() => setIsSearch(true)}
          />
          {isSearch && <Address isSearch={isSearch} setIsSearch={setIsSearch} setBusinessAddress={setClientAddress} />}
          <button type="button" className={styles.resetButton} disabled={isSearch} onClick={() => setClientAddress('')}>
            초기화
          </button>
        </div>
        <div className={styles['form-row']}>
          <span className={styles.label}>거래유형</span>
          <div className={styles.radioGroup}>
            {['카드결제', '현금결제', '계좌이체', '기타'].map((type) => (
              <label key={type} className={`${styles.radioLabel} ${transactionType === type ? styles.checked : ''}`}>
                <input
                  type="radio"
                  name="transaction_type"
                  value={type}
                  checked={transactionType === type}
                  onChange={handleTransactionTypeChange}
                  className={styles.radioInput}
                  disabled={isSearch}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>
      <table className={styles.table}>
        <colgroup>
          <col style={{ width: '4%' }} /> {/* 체크박스 열 */}
          <col style={{ width: '20%' }} /> {/* 제품명 열 */}
          <col style={{ width: '13%' }} /> {/* 규격 열 */}
          <col style={{ width: '10%' }} /> {/* 수량 열 */}
          <col style={{ width: '10%' }} /> {/* 단위 열 */}
          <col style={{ width: '10%' }} /> {/* 단가 열 */}
          <col style={{ width: '13%' }} /> {/* 공급가액 열 */}
          <col style={{ width: '10%' }} /> {/* 부가세 열 */}
          <col style={{ width: '10%' }} /> {/* 적요 열 */}
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
                  const updatedRows = rows.map((row) => ({ ...row, selected: !allChecked }));
                  setAllChecked((prev) => !prev);
                  setRows(updatedRows);
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
            <tr key={row.id} className={styles.row}>
              <td className={styles.cell}>
                <input
                  type="checkbox"
                  name={`checkbox`}
                  className={styles.checkbox}
                  checked={row.selected}
                  onChange={(e) => {
                    const updatedRows = [...rows];
                    updatedRows[index].selected = e.target.checked;
                    setRows(updatedRows);
                  }}
                />
              </td>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className={styles.cell}>
                  {cellIndex === 0 ? (
                    <div className={styles.productNameContainer}>
                      <button type="button" className={styles.searchButton}>
                        <FiSearch />
                      </button>
                      <input
                        className={styles.tableInput}
                        type="text"
                        name={`cell`}
                        value={cell}
                        onChange={(e) => handleInputChange(e.target.value, index, cellIndex)}
                      />
                    </div>
                  ) : (
                    <input
                      className={styles.tableInput}
                      type="text"
                      name={`cell`}
                      value={cell}
                      onChange={(e) => handleInputChange(e.target.value, index, cellIndex)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}

          <tr className={styles.row}>
            <td className={styles.rcell} colSpan={rowSize + 1}>
              <div className={styles.buttonContainer}>
                <div className={styles.buttons}>
                  <button type="button" onClick={handleAddRow} className={`${styles.addButton} ${styles.addRowButton}`}>
                    행 추가
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedRows}
                    className={`${styles.addButton} ${styles.deleteButton}`}
                  >
                    선택 삭제
                  </button>
                </div>
                <div className={styles.buttons}>
                  <button type="button" onClick={() => {}} className={`${styles.addButton} ${styles.saveButton}`}>
                    저장
                  </button>
                  <button type="button" onClick={() => {}} className={`${styles.addButton} ${styles.savePrintButton}`}>
                    저장 및 출력
                  </button>
                  <button type="button" onClick={() => {}} className={`${styles.addButton} ${styles.emailButton}`}>
                    메일 보내기
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
}
