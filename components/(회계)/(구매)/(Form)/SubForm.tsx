import DatePicker from '@/components/(회계)/(공용)/DatePicker';
import Address from '@/components/(회계)/(구매)/(Form)/Address';
import handleClientSearchClick from '@/components/(회계)/(구매)/(Form)/ClientSearchClick';
import { ChangeEvent } from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from './PurchaseForm.module.css';

interface SubFormProps {
  formData: any;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleInitForm: ({ name, value }: { name: string; value: string }) => void;
  handleDateChange: (date: Date | null) => void;
  handleTransactionTypeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clear: () => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  transactionType: string;
  clientAddress: string;
  setClientAddress: (address: string) => void;
  isSearch: boolean;
  setIsSearch: (value: boolean) => void;
}

export default function SubForm({
  formData,
  handleChange,
  handleInitForm,
  handleDateChange,
  handleTransactionTypeChange,
  clear,
  startDate,
  setStartDate,
  transactionType,
  clientAddress,
  setClientAddress: setSupplierAddress,
  isSearch,
  setIsSearch,
}: SubFormProps) {
  return (
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
          title="매입 정보가 모두 초기화 됩니다."
        >
          모두 초기화
        </button>
      </div>
      <div className={styles['form-row']}>
        <label htmlFor="purchase_date" className={styles.label}>
          거래일자
        </label>
        <div className={styles.dateInput}>
          <DatePicker
            selectedDate={startDate}
            onDateChange={handleDateChange}
            disabled={isSearch}
            inputId="purchase_date"
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
        {isSearch && <Address isSearch={isSearch} setIsSearch={setIsSearch} setBusinessAddress={setSupplierAddress} />}
        <button type="button" className={styles.resetButton} disabled={isSearch} onClick={() => setSupplierAddress('')}>
          주소 초기화
        </button>
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="supplier_tel" className={styles.label}>
          전화번호
        </label>
        <input
          id="supplier_tel"
          name="supplier_tel"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.supplier_tel}
          onChange={handleChange}
          disabled={isSearch}
        />
        <label htmlFor="supplier_fax" className={styles.label} style={{ textAlign: 'center' }}>
          팩스번호
        </label>
        <input
          id="supplier_fax"
          name="supplier_fax"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.supplier_fax}
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
  );
}
