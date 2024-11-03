'use client';
import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(판매)/Address';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { format } from 'date-fns';
import { ChangeEvent, useState } from 'react';
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

  // 기존 formData 상태와 관리 함수 유지
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

  // 초기화 함수들 (각 필드를 개별적으로 초기화)
  function resetProductName() {
    handleChange({ target: { name: 'client_name', value: '' } } as ChangeEvent<HTMLInputElement>);
  }

  function resetStartDate() {
    setStartDate(new Date());
    setFormData((prev) => ({
      ...prev,
      sale_date: '',
    }));
  }

  function resetClientAddress() {
    setClientAddress('');
  }

  return (
    <form className={styles.form}>
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
        <div className={styles.subTitle}>거래처 정보</div>
        <div className={styles['form-row']}>
          <label htmlFor="client_name" className={styles.label}>
            거래처명
          </label>
          <button type={'button'} className={styles.searchButton}>
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
          <button type="button" className={styles.resetButton} disabled={isSearch} onClick={resetProductName}>
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
          <button type="button" className={styles.resetButton} disabled={isSearch} onClick={resetStartDate}>
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
          <button type="button" className={styles.resetButton} disabled={isSearch} onClick={resetClientAddress}>
            초기화
          </button>
        </div>
        <div className={styles['form-row']}>
          <label className={styles.label}>거래유형</label>
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
    </form>
  );
}
