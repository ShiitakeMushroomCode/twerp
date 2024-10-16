'use client';
import styles from '@/styles/client-add.module.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { ChangeEvent, FormEvent, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Address from './Address';

interface FormData {
  business_number: string;
  company_name: string;
  representative_name: string;
  start_date: string;
  business_status: string;
  main_item_name: string;
  business_address: string;
  tell_number: string;
  fax_number: string;
  billing_email: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ClientAdd({ AddClient }) {
  const [addrNum, setAddrNum] = useState('');
  const [addr, setAddr] = useState('');
  const [detailAddr, setDetailAddr] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    business_number: '',
    company_name: '',
    representative_name: '',
    start_date: '',
    business_status: '',
    main_item_name: '',
    business_address: '',
    tell_number: '',
    fax_number: '',
    billing_email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [startDate, setStartDate] = useState<Date | null>(null);

  function handleDateChange(date: Date | null) {
    if (date.getTime() > new Date().getTime()) {
      setStartDate(new Date());
    } else {
      setStartDate(date);
    }
    // setStartDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData((prev) => ({
        ...prev,
        start_date: formattedDate,
      }));
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let filteredValue = value;

    if (['business_number', 'tell_number', 'fax_number'].includes(name)) {
      filteredValue = value.replace(/[^0-9]/g, '');
    }

    if (name === 'billing_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        billing_email: emailRegex.test(value) || value === '' ? '' : '유효한 이메일 형식이 아닙니다.',
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!formData.business_number) newErrors.business_number = '사업자번호는 필수입니다.';
    if (!formData.company_name) newErrors.company_name = '상호는 필수입니다.';
    if (formData.billing_email && errors.billing_email) newErrors.billing_email = errors.billing_email;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    AddClient(formData);
    // setFormData({
    //   business_number: '',
    //   company_name: '',
    //   representative_name: '',
    //   start_date: '',
    //   business_status: '',
    //   main_item_name: '',
    //   business_address: '',
    //   tell_number: '',
    //   fax_number: '',
    //   billing_email: '',
    // });
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.title}>거래처 추가하기</div>
      <div className={styles['form-row']}>
        <label htmlFor="business_number" className={styles.label}>
          사업자번호
        </label>
        <input
          id="business_number"
          name="business_number"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.business_number}
          onChange={handleChange}
          disabled={isSearch}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="company_name" className={styles.label}>
          상호
        </label>
        <input
          id="company_name"
          name="company_name"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.company_name}
          onChange={handleChange}
          disabled={isSearch}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="representative_name" className={styles.label}>
          대표자명
        </label>
        <input
          id="representative_name"
          name="representative_name"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.representative_name}
          onChange={handleChange}
          disabled={isSearch}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="start_date" className={styles.label}>
          개업일자
        </label>
        <DatePicker
          id="start_date"
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="yyyy년 MM월 dd일"
          className={`${styles.input} ${styles.datePicker}`}
          locale={ko}
          required
          disabled={isSearch}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className={styles.datePickerHeader}>
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={styles.navButton}
              >
                {'<'}
              </button>
              <span className={styles.headerTitle}>
                {date.getFullYear()}년 {date.getMonth() + 1}월
              </span>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className={styles.navButton}
              >
                {'>'}
              </button>
            </div>
          )}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="business_status" className={styles.label}>
          업태
        </label>
        <input
          id="business_status"
          name="business_status"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.business_status}
          disabled={isSearch}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="main_item_name" className={styles.label}>
          주종목명
        </label>
        <input
          id="main_item_name"
          name="main_item_name"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.main_item_name}
          onChange={handleChange}
          disabled={isSearch}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="business_address" className={styles.label}>
          주소
        </label>
        <input
          id="business_address"
          name="business_address"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.business_address}
          disabled={isSearch}
          onChange={handleChange}
          title={formData.business_address}
          onClick={() => {
            setIsSearch(true);
          }}
        />
        {isSearch && (
          <Address
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            addrNum={addrNum}
            setAddrNum={setAddrNum}
            addr={addr}
            setAddr={setAddr}
            detailAddr={detailAddr}
            setDetailAddr={setDetailAddr}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="tell_number" className={styles.label}>
          대표번호
        </label>
        <input
          id="tell_number"
          name="tell_number"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.tell_number}
          disabled={isSearch}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="fax_number" className={styles.label}>
          팩스번호
        </label>
        <input
          id="fax_number"
          name="fax_number"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.fax_number}
          onChange={handleChange}
          disabled={isSearch}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="billing_email" className={styles.label}>
          이메일
        </label>
        <input
          id="billing_email"
          name="billing_email"
          type="email"
          className={styles.input}
          autoComplete="off"
          value={formData.billing_email}
          disabled={isSearch}
          onChange={handleChange}
        />
      </div>
      <div className={styles['form-row']}>
        {errors.business_number && <span className={styles.error}>{errors.business_number}</span>}
        {errors.company_name && <span className={styles.error}>{errors.company_name}</span>}
        {errors.billing_email && <span className={styles.error}>{errors.billing_email}</span>}
      </div>
      <button type="submit" className={styles.button} disabled={isSearch}>
        등록
      </button>
    </form>
  );
}
