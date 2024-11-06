'use client';
import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(판매)/Address';
import handleClientSearchClick from '@/components/(회계)/(판매)/ClientSearchClick';
import ProductSearchClick from '@/components/(회계)/(판매)/ProductSearchClick';
import { isEmpty } from '@/util/lo';
import { formatPhoneNumber, numberToKorean } from '@/util/reform';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { addHours, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import styles from './SalesForm.module.css';

interface Row {
  product_id: string;
  product_name: string;
  standard: string;
  price: string;
  supply_amount: string;
  sub_price: string;
  quantity: string;
  unit: string;
  description: string;
  selected: boolean;
}
export interface SalesFormData {
  company_id: string;
  sale_date: string;
  transaction_type: string;
  collection: string;
  client_id: string | null;
  client_name: string;
  client_address: string;
  client_tel: string;
  client_fax: string;
  description: string;
  sales_items: Row[];
}

type EditableField = Exclude<keyof Row, 'selected' | 'supply_amount'>;

export default function SalesForm({ initialData, onSubmit, isEditMode = false }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useUnsavedChangesWarning(hasUnsavedChanges);

  type TransactionType = '카드결제' | '현금결제' | '계좌이체' | '기타';

  const [isSearch, setIsSearch] = useState(false);
  const [clientAddress, setClientAddress] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<TransactionType>('카드결제');
  const router = useRouter();

  const [formData, setFormData] = useState(() => ({
    company_id: initialData?.company_id || '',
    sales_id: '',
    sale_date: '',
    transaction_type: '카드결제',
    collection: '진행중',
    client_id: null,
    client_name: '',
    client_address: '',
    client_tel: '',
    client_fax: '',
    description: '',
    sales_items: [], // sales_items를 배열 속 객체로 관리
  }));

  const initialRow: Row = {
    product_id: '',
    product_name: '',
    standard: '',
    price: '',
    supply_amount: '',
    sub_price: '',
    quantity: '',
    unit: '',
    description: '',
    selected: false,
  };

  function clear() {
    setFormData((prev) => ({
      ...prev,
      client_name: '',
      client_id: '',
      client_address: '',
      client_tel: '',
      client_fax: '',
      description: '',
    }));
    setTransactionType('카드결제');
    setStartDate(new Date());
    setClientAddress('');
    setRows((prev) => {
      return [initialRow, initialRow, initialRow, initialRow, initialRow];
    });
  }

  const [rows, setRows] = useState<Row[]>(() => {
    const initialRows: Row[] = [];
    for (let i = 0; i < 5; i++) {
      initialRows.push({ ...initialRow });
    }
    return initialRows;
  });

  useEffect(() => {
    if (initialData) {
      const safeInitialData = {
        ...initialData,
        company_id: initialData?.['company_id']?.toString() || '',
        sale_date: initialData?.['sale_date'] ? addHours(new Date(initialData['sale_date']), 9) : new Date(),
        transaction_type: initialData?.['transaction_type'] || '카드결제',
        collection: initialData?.['collection'] || '진행중',
        client_id: initialData?.['client_id'] || null,
        client_name: initialData?.['client_name'] || '',
        client_address: initialData?.['client_address'] || '',
        client_tel: initialData?.['client_tel'] || '',
        client_fax: initialData?.['client_fax'] || '',
        description: initialData?.['description'] || '',
        sales_items:
          initialData?.['sales_items']?.map((item) => ({
            ...item,
            supply_amount:
              item.price && item.quantity ? (parseInt(item.price, 10) * parseInt(item.quantity, 10)).toString() : '', // 공급가액 계산
          })) || [],
      };

      setFormData(safeInitialData);
      setRows(() => {
        const mappedRows = safeInitialData.sales_items.map((item) => ({
          product_id: item?.['product_id'] || '',
          product_name: item?.['product_name'] || '',
          standard: item?.['standard'] || '',
          price: item?.['price'] || '',
          supply_amount: item?.['supply_amount'] || '',
          sub_price: item?.['sub_price'] || '',
          quantity: item?.['quantity'] || '',
          unit: item?.['unit'] || '',
          description: item?.['description'] || '',
          selected: false,
        }));

        // 행의 수가 5개 미만이면 빈 행을 추가하여 5개로 만듭니다.
        while (mappedRows.length < 5) {
          mappedRows.push({ ...initialRow });
        }

        return mappedRows;
      });

      if (safeInitialData.sale_date) {
        const parsedDate = addHours(new Date(safeInitialData.sale_date), 9);
        if (!isNaN(parsedDate.getTime())) {
          setStartDate(parsedDate);
        } else {
          setStartDate(new Date());
        }
      } else {
        setStartDate(new Date());
      }

      setClientAddress(safeInitialData.client_address || '');
      setTransactionType(safeInitialData.transaction_type as TransactionType);
    }
  }, [initialData]);

  /**
   * 제품 선택 시 해당 행의 데이터를 업데이트하는 함수
   * @param index - 행의 인덱스
   */
  const handleProductSelect = (index: number) => {
    ProductSearchClick({
      handleSelectProduct: (selectedProduct) => {
        setRows((prevRows) => {
          const updatedRows = [...prevRows];
          updatedRows[index] = {
            ...updatedRows[index],
            product_id: selectedProduct.product_id || '',
            product_name: selectedProduct.product_name || '',
            standard: selectedProduct.standard || '',
            price: selectedProduct.price || '',
            unit: selectedProduct.unit || '',
            sub_price: selectedProduct.sub_price || '',
            description: selectedProduct.description || '',
          };
          return updatedRows;
        });
      },
    });
  };

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
   * @param index - 행의 인덱스
   * @param field - 변경된 필드
   * @param value - 새로운 값
   */
  const handleInputChange = (index: number, field: EditableField, value: string) => {
    // 숫자 입력 필드에서 쉼표 제거
    const rawValue = value.replace(/,/g, '');

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const updatedRow = { ...updatedRows[index] };

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

      updatedRows[index] = updatedRow;
      return updatedRows;
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
  async function handleSaveButton() {
    // 먼저 rows에서 필요한 데이터를 필터링하고 처리
    try {
      const fRows = rows
        .filter((row) => {
          if (
            isEmpty(row.product_name.trim()) &&
            isEmpty(row.standard.trim()) &&
            isEmpty(row.quantity.trim()) &&
            isEmpty(row.unit.trim()) &&
            isEmpty(row.price.trim()) &&
            isEmpty(row.description.trim())
          ) {
            // 모든 필드가 비어있을 경우 해당 행은 제외
            return false;
          }
          return true;
        })
        .filter((row) => {
          if (isEmpty(row.product_name.trim())) {
            showErrorModal('제품명이 없습니다.');
            throw new Error('제품명이 없습니다.');
          }
          if (isEmpty(row.quantity.trim())) {
            showErrorModal('수량이 없습니다.');
            throw new Error('수량이 없습니다.');
          }
          if (isEmpty(row.price.trim())) {
            showErrorModal('단가가 없습니다.');
            throw new Error('단가가 없습니다.');
          }
          return true;
        })
        .map((row) => ({
          product_id: row.product_id.trim() || null,
          product_name: row.product_name.trim(),
          standard: row.standard.trim(),
          price: parseInt(row.price.trim().replace(/,/g, ''), 10) || 0,
          quantity: parseInt(row.quantity.trim().replace(/,/g, ''), 10) || 0,
          unit: row.unit.trim(),
          description: row.description.trim(),
          sub_price: parseInt(row.sub_price.trim().replace(/,/g, ''), 10) || 0,
        }));

      // 모든 데이터를 포함한 새로운 formData 생성
      const newFormData = {
        ...formData,
        client_address: clientAddress,
        sale_date: format(startDate, 'yyyy-MM-dd'),
        sales_items: fRows,
      };

      // 필수 항목 체크: 거래처명, 거래일자, 거래유형, 제품 항목
      if (isEmpty(newFormData.client_name)) {
        showErrorModal('거래처명이 없습니다.');
        return;
      }
      if (isEmpty(newFormData.sale_date)) {
        showErrorModal('거래일자가 없습니다.');
        return;
      }
      if (isEmpty(newFormData.transaction_type)) {
        showErrorModal('거래유형이 없습니다.');
        return;
      }
      if (newFormData.sales_items.length === 0) {
        showErrorModal('제품이 하나도 없습니다.');
        return;
      }

      // formData 업데이트
      setFormData(newFormData);
      // console.log(newFormData);
      // 필요한 경우, 여기서 API 호출 등 저장 로직을 실행
      // console.log('formData:', newFormData);

      // onSubmit 콜백이 있다면 호출
      if (onSubmit) {
        const response = await onSubmit(newFormData);
        if (response.status === 'error') {
          await Swal.fire({
            title: '오류',
            html: response.message,
            icon: 'error',
            confirmButtonText: '확인',
          });
        } else if (response.status === 'success') {
          setHasUnsavedChanges(false);
          await Swal.fire({
            title: '성공',
            text: response.message,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          });
          if (!isEditMode) {
            clear();
          }
          localStorage.setItem('reloadSalesItems', new Date().toString());
          if (window.name.startsWith('editPopup')) {
            window.close();
          } else {
            router.push('/sales-list');
          }
        }
      }
      // fRows가 정상적으로 생성된 경우 추가 작업 수행
      // console.log('Filtered and mapped rows:', fRows);
    } catch (error) {
      // 오류가 발생한 경우 추가 처리
      // console.error('Error:', error.message);
      showErrorModal('저장 중 오류가 발생했습니다.');
      return;
    }
  }

  // 오류 모달 표시 함수
  function showErrorModal(message) {
    Swal.fire({
      icon: 'error',
      title: '오류',
      text: message,
      showConfirmButton: false,
      timer: 1500, // 1.5초 후 자동으로 닫힘
    });
  }

  /**
   * 일반 입력 필드 변경 시 상태 업데이트
   * @param e - 이벤트 객체
   */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === 'client_fax' || name === 'client_tel') {
      if (value.length <= 14) {
        setFormData((prev) => ({
          ...prev,
          [name]: formatPhoneNumber(value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleInitForm({ name, value }) {
    if (name === 'client_address') {
      setClientAddress(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /**
   * 새로운 행 추가
   */
  const handleAddRow = () => {
    setRows((prevRows) => [...prevRows, { ...initialRow }]);
  };

  const [allChecked, setAllChecked] = useState(false);

  /**
   * 선택된 행 삭제 및 최소 행 유지
   */
  const handleDeleteSelectedRows = () => {
    setRows((prevRows) => {
      let updatedRows = prevRows.filter((row) => !row.selected);

      // 최소 5개의 행이 유지되도록 빈 행 추가
      while (updatedRows.length < 5) {
        updatedRows.push({ ...initialRow });
      }

      return updatedRows;
    });
    setAllChecked(false);
  };

  /**
   * 폼 제출 시 저장 로직 호출
   * @param e - 이벤트 객체
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  /**
   * 총 공급가액, 총 부가세, 총액 계산
   */
  const totalSupplyAmount = rows.reduce((sum, row) => {
    return sum + (parseInt(row.supply_amount, 10) || 0);
  }, 0);

  const totalSubPrice = rows.reduce((sum, row) => {
    return sum + (parseInt(row.sub_price, 10) || 0);
  }, 0);

  const totalAmount = totalSupplyAmount + totalSubPrice;

  async function handleDelete() {
    if (!formData.sales_id) {
      await Swal.fire({
        title: '오류',
        text: '삭제할 매출 기록의 ID가 필요합니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: '삭제 확인',
      text: '정말로 매출 기록을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`/api/salesDelete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ sales_id: formData.sales_id }),
        });

        const data = await response.json();

        if (response.ok) {
          setHasUnsavedChanges(false);
          await Swal.fire({
            title: '성공',
            text: data.message,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          });

          localStorage.setItem('reloadSalesItems', new Date().toString());
          if (window.name.startsWith('editPopup')) {
            window.close();
          } else {
            router.push('/sales-list');
          }
        } else {
          await Swal.fire({
            title: '오류',
            text: data.message,
            icon: 'error',
            confirmButtonText: '확인',
          });
        }
      } catch (error) {
        console.error('삭제 요청 중 오류 발생:', error);
        await Swal.fire({
          title: '오류',
          text: '매출 기록 삭제 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonText: '확인',
        });
      }
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.title}>
        <span>{isEditMode ? '매출 정보 수정하기' : '매출 정보 추가하기'}</span>
        {isEditMode && (
          <button
            type="button"
            className={styles.delButton}
            onClick={() => {
              handleDelete();
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
          <button
            type="button"
            className={styles.searchButton}
            onClick={() => {
              handleClientSearchClick({ handleInitForm });
            }}
          >
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
            onClick={() => {
              clear();
            }}
            title="매출 정보가 모두 초기화 됩니다."
          >
            모두 초기화
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
            날짜 초기화
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
            주소 초기화
          </button>
        </div>

        <div className={styles['form-row']}>
          <label htmlFor="client_tel" className={styles.label}>
            전화번호
          </label>
          <input
            id="client_tel"
            name="client_tel"
            type="text"
            className={styles.input}
            required
            autoComplete="off"
            value={formData.client_tel}
            onChange={handleChange}
            disabled={isSearch}
          />
          <label htmlFor="client_fax" className={styles.label} style={{ textAlign: 'center' }}>
            팩스번호
          </label>
          <input
            id="client_fax"
            name="client_fax"
            type="text"
            className={styles.input}
            required
            autoComplete="off"
            value={formData.client_fax}
            onChange={handleChange}
            disabled={isSearch}
          />
        </div>

        <div className={styles['form-row']}>
          <label htmlFor="description" className={styles.label}>
            설명
          </label>
          <input
            id="description"
            name="description"
            type="text"
            className={styles.input}
            required
            autoComplete="off"
            value={formData.description}
            title={formData.description}
            onChange={handleChange}
            disabled={isSearch}
          />
        </div>
        <div className={styles['form-row']} style={{ marginBottom: '0' }}>
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
                  value={formatNumber(row.quantity)}
                  onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
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
                  value={formatNumber(row.price)}
                  onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                  autoComplete="off"
                  disabled={isSearch}
                  title={
                    !isEmpty(row.price) ? `\\${formatNumber(row.price)}\n${numberToKorean(row.price)}원정` : undefined
                  }
                />
              </td>
              <td className={styles.cell}>
                <input
                  className={`${styles.tableInput} ${styles.rightAlign}`}
                  type="text"
                  name={`supply_amount_${index}`}
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
                  className={`${styles.tableInput} ${styles.rightAlign}`}
                  type="text"
                  name={`sub_price_${index}`}
                  value={formatNumber(row.sub_price)}
                  onChange={(e) => handleInputChange(index, 'sub_price', e.target.value)}
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
    </form>
  );
}
