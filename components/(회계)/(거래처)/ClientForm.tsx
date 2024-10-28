'use client';
import { formatPhoneNumber } from '@/util/reform';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import Address from './Address';
import styles from './ClientForm.module.css';
import DatePicker from './DatePicker';
import Modal from './Modal';

export interface ClientFormData {
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

function formatBusinessNumber(value: string): string {
  const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 10);
  const parts = [];
  if (cleanValue.length > 0) {
    parts.push(cleanValue.substring(0, 3));
  }
  if (cleanValue.length > 3) {
    parts.push(cleanValue.substring(3, 5));
  }
  if (cleanValue.length > 5) {
    parts.push(cleanValue.substring(5, 10));
  }
  return parts.join('-');
}

interface ClientFormProps {
  initialData?: ClientFormData;
  onSubmit: (formData: ClientFormData) => Promise<{ status: string; message: string }>;
  isEditMode?: boolean;
}

export default function ClientForm({ initialData, onSubmit, isEditMode = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(() => ({
    business_number: initialData?.business_number ? formatBusinessNumber(initialData.business_number) : '',
    company_name: initialData?.company_name || '',
    representative_name: initialData?.representative_name || '',
    start_date: initialData?.start_date || '',
    business_status: initialData?.business_status || '',
    main_item_name: initialData?.main_item_name || '',
    business_address: initialData?.business_address || '',
    tell_number: initialData?.tell_number ? formatPhoneNumber(initialData.tell_number) : '',
    fax_number: initialData?.fax_number ? formatPhoneNumber(initialData.fax_number) : '',
    billing_email: initialData?.billing_email || '',
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.start_date ? new Date(initialData.start_date) : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [addrNum, setAddrNum] = useState('');
  const [addr, setAddr] = useState('');
  const [detailAddr, setDetailAddr] = useState('');
  const router = useRouter();

  function handleDateChange(date: Date | null) {
    if (date) {
      setStartDate(date);
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
      const numericValue = value.replace(/[^0-9]/g, '');

      if (name === 'business_number') {
        filteredValue = formatBusinessNumber(numericValue);
      } else {
        filteredValue = formatPhoneNumber(numericValue);
      }
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!formData.business_number) newErrors.business_number = '사업자번호는 필수입니다.';
    if (!formData.company_name) newErrors.company_name = '상호는 필수입니다.';
    if (formData.billing_email && errors.billing_email) newErrors.billing_email = errors.billing_email;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const formattedStartDate = formData.start_date ? format(new Date(formData.start_date), 'yyyyMMdd') : '';

    const submitData: ClientFormData = {
      ...formData,
      business_number: formData.business_number.replace(/-/g, ''),
      tell_number: formData.tell_number.replace(/-/g, ''),
      fax_number: formData.fax_number.replace(/-/g, ''),
      start_date: formattedStartDate,
    };

    const response = await onSubmit(submitData);

    if (response.status === 'error') {
      setModalMessage(response.message);
    } else if (response.status === 'success') {
      setIsModalOpen(true);
      setModalMessage(response.message);
      if (!isEditMode) {
        clear();
      }
      setTimeout(() => {
        setIsModalOpen(false);
        router.push('/client-list');
      }, 1500);
    }
    setIsModalOpen(true);
  }

  function clear() {
    setFormData({
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
    setStartDate(null);
    setErrors({});
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.title}>{isEditMode ? '거래처 수정하기' : '거래처 추가하기'}</div>

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
            title={formData.business_number}
            onChange={handleChange}
            disabled={isSearch}
            maxLength={12}
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
            title={formData.company_name}
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
            title={formData.representative_name}
            onChange={handleChange}
            disabled={isSearch}
          />
        </div>

        <div className={styles['form-row']}>
          <label htmlFor="start_date" className={styles.label}>
            개업일자
          </label>
          <div className={styles.dateInput}>
            <DatePicker
              selectedDate={startDate}
              onDateChange={handleDateChange}
              disabled={isSearch}
              inputId="start_date"
            />
          </div>
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
            title={formData.business_status}
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
            title={formData.main_item_name}
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
            className={`${styles.input} ${styles.hover}`}
            autoComplete="off"
            value={formData.business_address}
            title={formData.business_address}
            disabled={isSearch}
            readOnly
            onClick={() => setIsSearch(true)}
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
            title={formData.tell_number}
            disabled={isSearch}
            onChange={handleChange}
            maxLength={14}
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
            title={formData.fax_number}
            onChange={handleChange}
            disabled={isSearch}
            maxLength={14}
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
            title={formData.billing_email}
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
          {isEditMode ? '수정' : '등록'}
        </button>
      </form>
      {isModalOpen && <Modal message={modalMessage} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
