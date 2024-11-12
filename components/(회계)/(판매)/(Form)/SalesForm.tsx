'use client';
import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(판매)/(Form)/Address';
import handleClientSearchClick from '@/components/(회계)/(판매)/(Form)/ClientSearchClick';
import ProductSearchClick from '@/components/(회계)/(판매)/(Form)/ProductSearchClick';
import ProductTable from '@/components/(회계)/(판매)/(Form)/ProductTable';
import { fetchClientEmail } from '@/util/Client';
import { isEmpty } from '@/util/lo';
import { formatPhoneNumber, isValidEmail } from '@/util/reform';
import { sendMailUtil } from '@/util/sendmail';
import { showErrorAlert } from '@/util/swalHelpers';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { addHours, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import styles from './SalesForm.module.css';

// UI 상태를 위한 Row 인터페이스
export interface Row {
  product_id: string;
  product_name: string;
  standard: string;
  price: string; // string으로 변경
  supply_amount: string; // string으로 변경
  sub_price: string; // string으로 변경
  quantity: string; // string으로 변경
  unit: string;
  description: string;
  selected: boolean; // 선택적으로 변경
}

// 실제 데이터 전송을 위한 SalesItem 인터페이스
export interface SalesItem {
  product_id: string | null;
  product_name: string;
  standard: string;
  price: string; // string으로 변경
  quantity: string; // string으로 변경
  unit: string;
  description: string;
  sub_price: string; // string으로 변경
}

// SalesFormData 인터페이스 수정
export interface SalesFormData {
  company_id: string;
  sales_id: string;
  sale_date: Date | string | null;
  transaction_type: string;
  collection: string;
  client_id: string | null;
  client_name: string;
  client_address: string;
  client_tel: string;
  client_fax: string;
  description: string;
  sales_items: SalesItem[]; // SalesItem[]로 변경
}

type EditableField = Exclude<keyof Row, 'selected' | 'supply_amount'>;

type TransactionType = '카드결제' | '현금결제' | '계좌이체' | '기타';

// 공급 금액과 부가세를 계산하는 함수
const calculateAmounts = (price: number, quantity: number): { supply_amount: string; sub_price: string } => {
  const supplyAmount = price * quantity;
  const vat = Math.round(supplyAmount * 0.1);

  return {
    supply_amount: supplyAmount.toString(),
    sub_price: vat.toString(),
  };
};

// 총 공급가액, 총 부가세, 총액을 계산하는 함수
const calculateTotalAmounts = (rows: Row[]) => {
  const totalSupplyAmount = rows.reduce((sum, row) => sum + (parseInt(row.supply_amount, 10) || 0), 0);
  const totalSubPrice = rows.reduce((sum, row) => sum + (parseInt(row.sub_price, 10) || 0), 0);
  const totalAmount = totalSupplyAmount + totalSubPrice;

  return { totalSupplyAmount, totalSubPrice, totalAmount };
};

interface SalesFormProps {
  initialData?: SalesFormData;
  onSubmit?: (data: SalesFormData) => Promise<{ status: string; message: string }>;
  isEditMode?: boolean;
}

const SalesForm: React.FC<SalesFormProps> = ({ initialData, onSubmit, isEditMode = false }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useUnsavedChangesWarning(hasUnsavedChanges);

  const [isSearch, setIsSearch] = useState(false);
  const [clientAddress, setClientAddress] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<TransactionType>('카드결제');
  const router = useRouter();

  const [formData, setFormData] = useState<SalesFormData>(() => ({
    company_id: initialData?.company_id || '',
    sales_id: initialData?.sales_id || '',
    sale_date: initialData?.sale_date || '',
    transaction_type: initialData?.transaction_type || '카드결제',
    collection: initialData?.collection || '진행중',
    client_id: initialData?.client_id || null,
    client_name: initialData?.client_name || '',
    client_address: initialData?.client_address || '',
    client_tel: initialData?.client_tel || '',
    client_fax: initialData?.client_fax || '',
    description: initialData?.description || '',
    sales_items: initialData?.sales_items || [],
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

  const [rows, setRows] = useState<Row[]>(() => Array(5).fill({ ...initialRow }));
  const [totalAmounts, setTotalAmounts] = useState<{
    totalSupplyAmount: number;
    totalSubPrice: number;
    totalAmount: number;
  }>({
    totalSupplyAmount: 0,
    totalSubPrice: 0,
    totalAmount: 0,
  });

  // 초기화 함수
  const clear = useCallback(() => {
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
    setRows(() => Array(5).fill({ ...initialRow }));
    setHasUnsavedChanges(false);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (initialData) {
      const safeInitialData = {
        ...initialData,
        company_id: initialData.company_id?.toString() || '',
        sale_date: initialData.sale_date ? new Date(initialData.sale_date) : new Date(),
        transaction_type: initialData.transaction_type || '카드결제',
        collection: initialData.collection || '진행중',
        client_id: initialData.client_id || null,
        client_name: initialData.client_name || '',
        client_address: initialData.client_address || '',
        client_tel: initialData.client_tel || '',
        client_fax: initialData.client_fax || '',
        description: initialData.description || '',
        sales_items:
          initialData.sales_items?.map((item) => ({
            ...item,
            supply_amount:
              item.price && item.quantity
                ? (parseInt(item.price.toString(), 10) * parseInt(item.quantity.toString(), 10)).toString()
                : '',
          })) || [],
      };

      setFormData(safeInitialData);
      setRows(() => {
        const mappedRows = safeInitialData.sales_items.map((item) => ({
          product_id: item.product_id?.toString() || '',
          product_name: item.product_name?.toString() || '',
          standard: item.standard?.toString() || '',
          price: item.price?.toString() || '',
          supply_amount: item.supply_amount?.toString() || '',
          sub_price: item.sub_price?.toString() || '',
          quantity: item.quantity?.toString() || '',
          unit: item.unit?.toString() || '',
          description: item.description?.toString() || '',
          selected: false,
        }));

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
   * 특정 행의 공급 금액과 부가세를 업데이트하는 함수
   * @param index - 행의 인덱스
   * @param updatedRow - 업데이트된 행 데이터
   */
  const updateRowAmounts = useCallback(
    (index: number, updatedRow: Row) => {
      const price = parseInt(updatedRow.price, 10);
      const quantity = parseInt(updatedRow.quantity, 10);

      if (!isNaN(price) && !isNaN(quantity)) {
        const { supply_amount, sub_price } = calculateAmounts(price, quantity);
        updatedRow.supply_amount = supply_amount;
        updatedRow.sub_price = sub_price;
      } else {
        updatedRow.supply_amount = '';
        updatedRow.sub_price = '';
      }

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index] = updatedRow;
        return updatedRows;
      });
    },
    [setRows]
  );

  /**
   * 제품 선택 시 해당 행의 데이터를 업데이트하는 함수
   * @param index - 행의 인덱스
   */
  const handleProductSelect = useCallback(
    (index: number) => {
      ProductSearchClick({
        handleSelectProduct: (selectedProduct) => {
          setRows((prevRows) => {
            const updatedRows = [...prevRows];
            const updatedRow = {
              ...updatedRows[index],
              product_id: selectedProduct.product_id || '',
              product_name: selectedProduct.product_name || '',
              standard: selectedProduct.standard || '',
              price: selectedProduct.price?.toString() || '',
              unit: selectedProduct.unit || '',
              sub_price: selectedProduct.sub_price?.toString() || '',
              description: selectedProduct.description || '',
            };
            updatedRows[index] = updatedRow;
            return updatedRows;
          });

          // 공급 금액과 부가세 계산
          const currentRow = rows[index];
          updateRowAmounts(index, {
            ...rows[index],
            price: selectedProduct.price?.toString() || '',
            quantity: currentRow.quantity.toString(),
          });
        },
      });
    },
    [updateRowAmounts, rows]
  );

  /**
   * 숫자 값을 포맷팅하여 반환
   * @param value - 원래 숫자 값
   * @returns 포맷팅된 숫자 문자열
   */
  const formatNumber = useCallback((value: string) => {
    if (value === '' || value === '-') return value;
    const num = Number(value);
    return isNaN(num) ? value : num.toLocaleString();
  }, []);

  /**
   * 입력 필드 변경 시 상태 업데이트 및 자동 계산 로직
   * @param index - 행의 인덱스
   * @param field - 변경된 필드
   * @param value - 새로운 값
   */
  const handleInputChange = useCallback(
    (index: number, field: EditableField, value: string) => {
      let newValue = value.replace(/,/g, '');

      if (['quantity', 'price', 'sub_price'].includes(field)) {
        newValue = newValue.replace(/[^\d-]/g, '').slice(0, 16);
      }

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        const updatedRow = { ...updatedRows[index] };

        updatedRow[field] = ['quantity', 'price', 'sub_price'].includes(field) ? newValue : value;

        if (['quantity', 'price'].includes(field)) {
          updateRowAmounts(index, updatedRow);
        }

        updatedRows[index] = updatedRow;
        return updatedRows;
      });
      setHasUnsavedChanges(true);
    },
    [updateRowAmounts]
  );

  /**
   * 거래일자 변경 시 상태 업데이트
   * @param date - 선택된 날짜
   */
  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setStartDate(date);
      setFormData((prev) => ({
        ...prev,
        sale_date: format(date, 'yyyy-MM-dd'),
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  /**
   * 거래유형 변경 시 상태 업데이트
   * @param e - 이벤트 객체
   */
  const handleTransactionTypeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTransactionType(e.target.value as TransactionType);
    setFormData((prev) => ({
      ...prev,
      transaction_type: e.target.value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * 총액 및 총 세액을 계산하여 상태 업데이트
   */
  useEffect(() => {
    const totals = calculateTotalAmounts(rows);
    setTotalAmounts(totals);
  }, [rows]);

  /**
   * 저장 버튼 클릭 시 데이터 준비 및 저장 로직 호출
   */
  const handleSaveButton = useCallback(
    async (navigate = true) => {
      try {
        const fRows = rows
          .filter((row) => {
            const fields = ['product_name', 'standard', 'quantity', 'unit', 'price', 'description'];
            return fields.some((field) => !isEmpty(row[field]?.toString().trim()));
          })
          .filter((row) => {
            if (isEmpty(row.product_name?.trim())) {
              showErrorModal('제품명이 없습니다.');
              throw new Error('제품명이 없습니다.');
            }
            if (isEmpty(row.quantity?.toString().trim())) {
              showErrorModal('수량이 없습니다.');
              throw new Error('수량이 없습니다.');
            }
            if (isEmpty(row.price?.toString().trim())) {
              showErrorModal('단가가 없습니다.');
              throw new Error('단가가 없습니다.');
            }
            return true;
          })
          .map((row) => ({
            product_id: row.product_id?.trim() || null,
            product_name: row.product_name?.trim(),
            standard: row.standard?.trim(),
            price: row.price?.toString().trim().replace(/,/g, '') || '0',
            quantity: row.quantity?.toString().trim().replace(/,/g, '') || '0',
            unit: row.unit?.trim(),
            description: row.description?.trim(),
            sub_price: row.sub_price?.toString().trim().replace(/,/g, '') || '0',
          }));

        const newFormData: SalesFormData = {
          ...formData,
          client_address: clientAddress,
          sale_date: format(startDate, 'yyyy-MM-dd'),
          sales_items: fRows,
        };

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

        setFormData(newFormData);
        setHasUnsavedChanges(false);

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
            if (navigate) {
              if (window.name.startsWith('editPopup')) {
                window.close();
              } else {
                router.push('/sales-list');
              }
            }
          }
        }
      } catch (error) {
        showErrorModal('저장 중 오류가 발생했습니다.');
      }
    },
    [rows, formData, clientAddress, startDate, onSubmit, isEditMode, clear, router]
  );

  // 오류 모달 표시 함수
  const showErrorModal = useCallback((message: string) => {
    Swal.fire({
      icon: 'error',
      title: '오류',
      text: message,
      showConfirmButton: false,
      timer: 1500,
    });
  }, []);

  /**
   * 일반 입력 필드 변경 시 상태 업데이트
   * @param e - 이벤트 객체
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['client_fax', 'client_tel'].includes(name)) {
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
    setHasUnsavedChanges(true);
  }, []);

  const handleInitForm = useCallback(({ name, value }: { name: string; value: string }) => {
    if (name === 'client_address') {
      setClientAddress(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * 새로운 행 추가
   */
  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [...prevRows, { ...initialRow }]);
    setHasUnsavedChanges(true);
  }, []);

  const [allChecked, setAllChecked] = useState(false);

  /**
   * 선택된 행 삭제 및 최소 행 유지
   */
  const handleDeleteSelectedRows = useCallback(() => {
    setRows((prevRows) => {
      let updatedRows = prevRows.filter((row) => !row.selected);
      while (updatedRows.length < 5) {
        updatedRows.push({ ...initialRow });
      }
      return updatedRows;
    });
    setAllChecked(false);
    setHasUnsavedChanges(true);
  }, []);

  /**
   * 폼 제출 시 저장 로직 호출
   * @param e - 이벤트 객체
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await handleSaveButton();
    },
    [handleSaveButton]
  );

  /**
   * 삭제
   */
  const handleDelete = useCallback(async () => {
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
  }, [formData.sales_id, router]);

  /**
   * 메일보내기
   */
  const handleSendMailButton = useCallback(async () => {
    const saveConfirm = await Swal.fire({
      title: '저장 확인',
      text: '저장 후 메일을 보낼 수 있습니다.\n저장하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '저장',
      cancelButtonText: '취소',
    });

    if (saveConfirm.isConfirmed) {
      // navigate를 false로 설정해 저장 후 이동을 막음
      await handleSaveButton(false);

      // 이후 메일 전송 로직
      if (isEmpty(formData.sales_id)) {
        showErrorAlert('메일보내기 실패', '현재 메일을 보낼 수 없는 기록입니다.');
        return;
      }

      const clientEmail = !isEmpty(formData.client_id) ? await fetchClientEmail(formData.client_id) : '';

      const { value: formValues } = await Swal.fire({
        title: '거래명세표 메일 보내기',
        html: `
        <div style="display: flex; flex-direction: column; gap: 10px; padding: 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; align-items: center;">
          <div style="display: flex; align-items: center; width: 100%; max-width: 500px; gap: 10px;">
            <label for="swal-input-recipient" style="font-size: 14px; color: #333; width: 80px; text-align: right; margin: 0;">
              받는 이
            </label>
            <input 
              id="swal-input-recipient" 
              type="email" 
              placeholder="example@test.com" 
              value="${clientEmail}" 
              autocomplete="off" 
              style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; transition: border-color 0.3s, box-shadow 0.3s;"
            >
          </div>
          <div style="display: flex; align-items: center; width: 100%; max-width: 500px; gap: 10px;">
            <label for="swal-input-subject" style="font-size: 14px; color: #333; width: 80px; text-align: right; margin: 0;">
              제목
            </label>
            <input 
              id="swal-input-subject" 
              type="text" 
              placeholder="메일 제목" 
              value="거래명세표 확인" 
              autocomplete="off" 
              style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; transition: border-color 0.3s, box-shadow 0.3s;"
            >
          </div>
          <div style="display: flex; align-items: center; width: 100%; max-width: 500px; gap: 10px;">
            <label for="swal-input-content" style="font-size: 14px; color: #333; width: 80px; text-align: right; margin: 0;">
              내용
            </label>
            <textarea 
              id="swal-input-content" 
              placeholder="메일 내용을 입력하세요" 
              autocomplete="off" 
              rows="3" 
              style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; transition: border-color 0.3s, box-shadow 0.3s;"
            ></textarea>
          </div>
        </div>
      `,
        focusConfirm: false,
        preConfirm: () => {
          const recipient = (document.getElementById('swal-input-recipient') as HTMLInputElement).value;
          const subject = (document.getElementById('swal-input-subject') as HTMLInputElement).value;
          const content = (document.getElementById('swal-input-content') as HTMLTextAreaElement).value;
          if (!isValidEmail(recipient)) {
            Swal.showValidationMessage('잘못된 이메일 형식입니다.');
            return false;
          }
          if (!recipient || !subject) {
            Swal.showValidationMessage('받는 이와 제목은 필수 입력 항목입니다.');
            return false;
          }
          return { recipient, subject, content };
        },
      });

      if (formValues) {
        Swal.fire({
          title: '메일 전송 중...',
          text: '잠시만 기다려주세요.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const success = await sendMailUtil({
          subject: formValues.subject,
          to: formValues.recipient,
          text: formValues.content,
          option: 'SendMailSaleTransactionStatement',
          id: formData.sales_id,
          html: null,
        });
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '메일 전송 성공',
            text: '메일이 성공적으로 전송되었습니다.',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          showErrorAlert('메일 보내기 실패', '메일 보내기에 실패했습니다.');
        }
      }
    }
  }, [formData, handleSaveButton, showErrorAlert]);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.title}>
        <span>{isEditMode ? '매출 정보 수정하기' : '매출 정보 추가하기'}</span>
        {isEditMode && (
          <button
            type='button'
            className={styles.delButton}
            onClick={handleDelete}
            disabled={isSearch}
            title='제품 삭제'
          >
            삭제
            <FaTrashAlt style={{ marginLeft: '0.5rem' }} />
          </button>
        )}
      </div>
      <div className={styles.subForm}>
        {/* 거래처명 */}
        <div className={styles['form-row']}>
          <label htmlFor='client_name' className={styles.label}>
            거래처명
          </label>
          <button
            type='button'
            className={styles.searchButton}
            onClick={() => handleClientSearchClick({ handleInitForm })}
          >
            <FiSearch />
          </button>
          <input
            id='client_name'
            name='client_name'
            type='text'
            className={styles.input}
            required
            autoComplete='off'
            value={formData.client_name}
            onChange={handleChange}
            disabled={isSearch}
          />
          <button
            type='button'
            className={styles.resetButton}
            disabled={isSearch}
            onClick={clear}
            title='매출 정보가 모두 초기화 됩니다.'
          >
            모두 초기화
          </button>
        </div>
        {/* 거래일자 */}
        <div className={styles['form-row']}>
          <label htmlFor='sale_date' className={styles.label}>
            거래일자
          </label>
          <div className={styles['dateInput']}>
            <DatePicker
              selectedDate={startDate}
              onDateChange={handleDateChange}
              disabled={isSearch}
              inputId='sale_date'
              maxDate={useMemo(() => new Date(new Date().setFullYear(new Date().getFullYear() + 5, 11, 31)), [])}
            />
          </div>
          <button
            type='button'
            className={styles.resetButton}
            disabled={isSearch}
            onClick={() => setStartDate(new Date())}
          >
            날짜 초기화
          </button>
        </div>
        {/* 주소 */}
        <div className={styles['form-row']}>
          <label htmlFor='client_address' className={styles.label}>
            주소
          </label>
          <input
            id='client_address'
            name='client_address'
            type='text'
            className={`${styles.input} ${styles.hover}`}
            autoComplete='off'
            value={clientAddress}
            title={clientAddress}
            readOnly
            onClick={() => setIsSearch(true)}
            disabled={isSearch}
          />
          {isSearch && <Address isSearch={isSearch} setIsSearch={setIsSearch} setBusinessAddress={setClientAddress} />}
          <button type='button' className={styles.resetButton} disabled={isSearch} onClick={() => setClientAddress('')}>
            주소 초기화
          </button>
        </div>
        {/* 전화번호 및 팩스번호 */}
        <div className={styles['form-row']}>
          <label htmlFor='client_tel' className={styles.label}>
            전화번호
          </label>
          <input
            id='client_tel'
            name='client_tel'
            type='text'
            className={styles.input}
            required
            autoComplete='off'
            value={formData.client_tel}
            onChange={handleChange}
            disabled={isSearch}
          />
          <label htmlFor='client_fax' className={styles.label} style={{ textAlign: 'center' }}>
            팩스번호
          </label>
          <input
            id='client_fax'
            name='client_fax'
            type='text'
            className={styles.input}
            required
            autoComplete='off'
            value={formData.client_fax}
            onChange={handleChange}
            disabled={isSearch}
          />
        </div>
        {/* 설명 */}
        <div className={styles['form-row']}>
          <label htmlFor='description' className={styles.label}>
            설명
          </label>
          <input
            id='description'
            name='description'
            type='text'
            className={styles.input}
            required
            autoComplete='off'
            value={formData.description}
            title={formData.description}
            onChange={handleChange}
            disabled={isSearch}
          />
        </div>
        {/* 거래유형 */}
        <div className={styles['form-row']} style={{ marginBottom: '0' }}>
          <span className={styles.label}>거래유형</span>
          <div className={styles.radioGroup}>
            {(['카드결제', '현금결제', '계좌이체', '기타'] as TransactionType[]).map((type) => (
              <label key={type} className={`${styles.radioLabel} ${transactionType === type ? styles.checked : ''}`}>
                <input
                  type='radio'
                  name='transaction_type'
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
      {/* 제품 테이블 */}
      <ProductTable
        isEditMode={isEditMode}
        rows={rows}
        setRows={setRows}
        isSearch={isSearch}
        handleProductSelect={handleProductSelect}
        handleInputChange={handleInputChange}
        totalSupplyAmount={totalAmounts.totalSupplyAmount}
        totalSubPrice={totalAmounts.totalSubPrice}
        totalAmount={totalAmounts.totalAmount}
        handleAddRow={handleAddRow}
        handleDeleteSelectedRows={handleDeleteSelectedRows}
        allChecked={allChecked}
        setAllChecked={setAllChecked}
        formatNumber={formatNumber}
        handleSaveButton={handleSaveButton}
        handleSendMailButton={handleSendMailButton}
      />
    </form>
  );
};

export default React.memo(SalesForm);
