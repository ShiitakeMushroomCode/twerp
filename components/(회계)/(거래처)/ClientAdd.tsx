'use client';
import styles from '@/styles/client-add.module.css';
import { ChangeEvent, FormEvent, useState } from 'react';

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
        />
        {errors.business_number && <span className={styles.error}>{errors.business_number}</span>}
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
        />
        {errors.company_name && <span className={styles.error}>{errors.company_name}</span>}
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
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="start_date" className={styles.label}>
          개업일자
        </label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.start_date}
          onChange={handleChange}
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
          onChange={handleChange}
        />
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
          onChange={handleChange}
        />
      </div>
      <div className={styles['form-row']}>
        {errors.billing_email && <span className={styles.error}>{errors.billing_email}</span>}
      </div>
      <button type="submit" className={styles.button}>
        등록
      </button>
    </form>
  );
}
