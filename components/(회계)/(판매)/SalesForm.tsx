'use client';
import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(판매)/Address';
import { isEmpty } from '@/util/lo';
import { numberToKorean } from '@/util/reform';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { format } from 'date-fns';
import { ChangeEvent, FormEvent, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import styles from './SalesForm.module.css';

interface Row {
  temp_id: string;
  product_id: string;
  product_name: string;
  standard: string;
  price: string;
  supply_amount: string; // 공급가액
  sub_price: string; // 부가세
  quantity: string;
  unit: string;
  description: string;
  selected: boolean;
}

type EditableField = Exclude<keyof Row, 'selected' | 'temp_id' | 'supply_amount'>; // 'sub_price'를 제외하지 않음

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
    sales_items: {}, // sales_items를 객체로 관리
  }));

  // 임시 식별자 생성을 위한 카운터
  const [tempIdCounter, setTempIdCounter] = useState(5); // 초기 5개의 행을 이미 생성했으므로 5으로 설정

  const initialRow: Row = {
    temp_id: '', // 임시 식별자
    product_id: '',
    product_name: '',
    standard: '',
    price: '',
    supply_amount: '', // 초기 공급가액
    sub_price: '', // 초기 부가세
    quantity: '',
    unit: '',
    description: '',
    selected: false,
  };

  const [rows, setRows] = useState<{ [key: string]: Row }>(() => {
    const initialRows: { [key: string]: Row } = {};
    for (let i = 0; i < 5; i++) {
      const tempId = `temp-${i}`;
      initialRows[tempId] = { ...initialRow, temp_id: tempId };
    }
    return initialRows;
  });

  /**
   * 숫자 값을 포맷팅하여 반환
   * @param value - 원래 숫자 값
   * @returns 포맷팅된 숫자 문자열
   */
  const formatNumber = (value: string) => {
    if (value === '' || value === '-') return value;
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  /**
   * 입력 필드 변경 시 상태 업데이트 및 자동 계산 로직
   * @param temp_id - 임시 식별자
   * @param field - 변경된 필드
   * @param value - 새로운 값
   */
  const handleInputChange = (temp_id: string, field: EditableField, value: string) => {
    // 숫자 입력 필드에서 쉼표 제거
    const rawValue = value.replace(/,/g, '');

    setRows((prevRows) => {
      const updatedRow = { ...prevRows[temp_id] };

      // 숫자 필드 필터링 및 길이 제한
      if (['quantity', 'price', 'sub_price'].includes(field)) {
        // 음수가 포함된 경우
        if (rawValue.startsWith('-')) {
          value = '-' + rawValue.slice(1).replace(/[^0-9]/g, '');
          if (value.length > 16) {
            value = value.slice(0, 16);
          }
        } else {
          value = rawValue.replace(/[^0-9]/g, '');
          if (value.length > 15) {
            value = value.slice(0, 15);
          }
        }
        updatedRow[field] = value;
      } else {
        updatedRow[field] = value;
      }

      // 수량 또는 단가가 변경되었을 때 공급가액과 부가세 계산
      if (['quantity', 'price'].includes(field)) {
        const quantity = parseInt(updatedRow.quantity, 10);
        const price = parseInt(updatedRow.price, 10);

        if (!isNaN(quantity) && !isNaN(price)) {
          const supply_amount = (price * quantity).toString();
          const sub_price = Math.round(price * quantity * 0.1).toString();
          updatedRow.supply_amount = supply_amount;
          updatedRow.sub_price = sub_price;
        } else {
          updatedRow.supply_amount = '';
          updatedRow.sub_price = '';
        }
      }

      return {
        ...prevRows,
        [temp_id]: updatedRow,
      };
    });
  };

  /**
   * 거래일자 변경 시 상태 업데이트
   * @param date - 선택된 날짜
   */
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

  /**
   * 거래유형 변경 시 상태 업데이트
   * @param e - 이벤트 객체
   */
  function handleTransactionTypeChange(e: ChangeEvent<HTMLInputElement>) {
    setTransactionType(e.target.value as TransactionType);
    setFormData((prev) => ({
      ...prev,
      transaction_type: e.target.value,
    }));
  }

  /**
   * 저장 버튼 클릭 시 데이터 준비 및 저장 로직 호출
   */
  function handleSaveButton() {
    const fRows = Object.values(rows)
      .filter((row) => {
        return (
          !isEmpty(row.product_name.trim()) ||
          !isEmpty(row.standard.trim()) ||
          !isEmpty(row.quantity.trim()) ||
          !isEmpty(row.unit.trim()) ||
          !isEmpty(row.price.trim()) ||
          !isEmpty(row.description.trim())
        );
      })
      .map((row) => ({
        product_id: row.product_id || null,
        product_name: row.product_name,
        standard: row.standard,
        price: parseInt(row.price, 10) || 0,
        quantity: parseInt(row.quantity, 10) || 0,
        unit: row.unit,
        description: row.description,
        sub_price: parseInt(row.sub_price, 10) || 0, // 부가세 포함
      }));
    console.log(fRows);
    // 추가적인 저장 로직 구현 (예: API 호출)
  }

  /**
   * 일반 입력 필드 변경 시 상태 업데이트
   * @param e - 이벤트 객체
   */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /**
   * 새로운 행 추가
   */
  const handleAddRow = () => {
    const newTempId = `temp-${tempIdCounter}`;
    setTempIdCounter((prev) => prev + 1);
    const newRow: Row = { ...initialRow, temp_id: newTempId };
    setRows((prevRows) => ({
      ...prevRows,
      [newTempId]: newRow,
    }));
  };

  const [allChecked, setAllChecked] = useState(false);

  /**
   * 선택된 행 삭제 및 최소 행 유지
   */
  const handleDeleteSelectedRows = () => {
    setRows((prevRows) => {
      let updatedRows = Object.values(prevRows).filter((row) => !row.selected);

      // 최소 5개의 행이 유지되도록 빈 행 추가
      while (updatedRows.length < 5) {
        const newTempId = `temp-${tempIdCounter + updatedRows.length}`;
        updatedRows.push({ ...initialRow, temp_id: newTempId });
      }

      // 변환된 배열을 객체로 재구성
      const newRows: { [key: string]: Row } = {};
      updatedRows.forEach((row, index) => {
        const tempId = `temp-${index + 1}`;
        newRows[tempId] = { ...row, temp_id: tempId };
      });

      setTempIdCounter(updatedRows.length);
      return newRows;
    });
    setAllChecked(false);
  };

  /**
   * 폼 제출 시 저장 로직 호출
   * @param e - 이벤트 객체
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSaveButton();
    if (onSubmit) {
      onSubmit(formData);
    }
  }

  /**
   * 총 공급가액, 총 부가세, 총액 계산
   */
  const totalSupplyAmount = Object.values(rows).reduce((sum, row) => {
    return sum + (parseInt(row.supply_amount, 10) || 0);
  }, 0);

  const totalSubPrice = Object.values(rows).reduce((sum, row) => {
    return sum + (parseInt(row.sub_price, 10) || 0);
  }, 0);

  const totalAmount = totalSupplyAmount + totalSubPrice;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.title}>
        <span>{isEditMode ? '매출 정보 수정하기' : '매출 정보 추가하기'}</span>
        {isEditMode && (
          <button
            type="button"
            className={styles.delButton}
            onClick={() => {
              // 삭제 로직 구현
            }}
            disabled={isSearch}
            title="제품 삭제"
          >
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
            disabled={isSearch}
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
                  const updatedRows = Object.keys(rows).reduce((acc, key) => {
                    acc[key] = { ...rows[key], selected: e.target.checked };
                    return acc;
                  }, {} as { [key: string]: Row });
                  setAllChecked(e.target.checked);
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
          {Object.values(rows).map((row) => (
            <tr key={row.temp_id} className={styles.row}>
              <td className={styles.cell}>
                <input
                  type="checkbox"
                  name={`checkbox_${row.temp_id}`}
                  className={styles.checkbox}
                  checked={row.selected}
                  onChange={(e) => {
                    setRows((prevRows) => ({
                      ...prevRows,
                      [row.temp_id]: {
                        ...prevRows[row.temp_id],
                        selected: e.target.checked,
                      },
                    }));
                  }}
                  disabled={isSearch}
                />
              </td>
              <td className={styles.cell}>
                <div className={styles.productNameContainer}>
                  <button type="button" className={styles.searchButton} disabled={isSearch}>
                    <FiSearch />
                  </button>
                  <input
                    className={styles.tableInput}
                    type="text"
                    name={`product_name_${row.temp_id}`}
                    value={row.product_name}
                    onChange={(e) => handleInputChange(row.temp_id, 'product_name', e.target.value)}
                    autoComplete="off"
                    disabled={isSearch}
                    title={row.product_name}
                  />
                </div>
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`standard_${row.temp_id}`}
                  value={row.standard}
                  onChange={(e) => handleInputChange(row.temp_id, 'standard', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={row.standard}
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`quantity_${row.temp_id}`}
                  value={formatNumber(row.quantity)}
                  onChange={(e) => handleInputChange(row.temp_id, 'quantity', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={
                    !isEmpty(row.quantity)
                      ? `${formatNumber(row.quantity)}${row.unit}\n${numberToKorean(row.quantity)}${row.unit}`
                      : undefined
                  }
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`unit_${row.temp_id}`}
                  value={row.unit}
                  onChange={(e) => handleInputChange(row.temp_id, 'unit', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={row.unit}
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`price_${row.temp_id}`}
                  value={formatNumber(row.price)}
                  onChange={(e) => handleInputChange(row.temp_id, 'price', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={
                    !isEmpty(row.price) ? `\\${formatNumber(row.price)}\n${numberToKorean(row.price)}원정` : undefined
                  }
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`supply_amount_${row.temp_id}`}
                  readOnly
                  value={formatNumber(row.supply_amount)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={
                    !isEmpty(row.supply_amount)
                      ? `\\${formatNumber(row.supply_amount)}\n${numberToKorean(row.supply_amount)}원정`
                      : undefined
                  }
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`sub_price_${row.temp_id}`}
                  value={formatNumber(row.sub_price)}
                  onChange={(e) => handleInputChange(row.temp_id, 'sub_price', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={
                    !isEmpty(row.sub_price)
                      ? `\\${formatNumber(row.sub_price)}\n${numberToKorean(row.sub_price)}원정`
                      : undefined
                  }
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={styles.tableInput}
                  type="text"
                  name={`description_${row.temp_id}`}
                  value={row.description}
                  onChange={(e) => handleInputChange(row.temp_id, 'description', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={row.description}
                />
              </td>
            </tr>
          ))}

          {/* 총합계 표시 */}
          <tr className={styles.row}>
            <td className={styles.rcell} colSpan={9}>
              <div className={styles.resultContainer}>
                <div className={styles.results}>
                  <span className={styles.resultTitle}>공급가액</span>
                  <span className={styles.resultValue} title={`\\${totalSupplyAmount.toLocaleString()}`}>
                    \{totalSupplyAmount.toLocaleString()}
                  </span>
                </div>
                <div className={styles.results}>
                  <span className={styles.resultTitle}>부가세</span>
                  <span className={styles.resultValue} title={`\\${totalSubPrice.toLocaleString()}`}>
                    \{totalSubPrice.toLocaleString()}
                  </span>
                </div>
                <div className={styles.results}>
                  <span className={styles.resultTitle}>총액</span>
                  <span className={styles.resultValue} title={`\\${totalAmount.toLocaleString()}`}>
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
    </form>
  );
}
