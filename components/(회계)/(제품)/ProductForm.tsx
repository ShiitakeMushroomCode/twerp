'use client';
import { useUnsavedChangesWarning } from '@/util/useUnsavedChangesWarning';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import DatePicker from '../(공용)/DatePicker';
import styles from './ProductForm.module.css';

export interface ProductFormData {
  product_id?: string;
  product_name: string;
  category: string;
  price: number;
  manufacturer: string;
  start_date: string;
  is_use: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (formData: ProductFormData) => Promise<{ status: string; message: string }>;
  isEditMode?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEditMode = false }: ProductFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useUnsavedChangesWarning(hasUnsavedChanges);
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    product_id: initialData?.product_id || undefined,
    product_name: initialData?.product_name || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    manufacturer: initialData?.manufacturer || '',
    start_date: initialData?.start_date || '',
    is_use: initialData?.is_use || '사용',
    description: initialData?.description || '',
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.start_date ? new Date(initialData.start_date) : new Date()
  );
  const router = useRouter();

  async function handleDelete() {
    if (!formData.product_id) {
      await Swal.fire({
        title: '오류',
        text: '삭제할 제품의 ID가 필요합니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: '삭제 확인',
      text: '정말로 이 제품을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`/api/itemDelete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ product_id: formData.product_id }),
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
          localStorage.setItem('reloadProductItems', new Date().toString());
          if (window.name.startsWith('editPopup')) {
            window.close();
          } else {
            router.push('/items-list');
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
          text: '제품 삭제 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonText: '확인',
        });
      }
    }
  }
  function handleDateChange(date: Date | null) {
    if (date) {
      setStartDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd'); // 날짜 형식을 'yyyy-MM-dd'로 설정
      setFormData((prev) => ({
        ...prev,
        start_date: formattedDate,
      }));
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    const value = e.target.value.trim();

    if (name === 'price') {
      // 음수 16자리, 양수 15자리 정규식
      const regex1 = /^-?\d*\.?\d*$/; // 숫자와 소수점만 허용
      const isNegative = value.startsWith('-'); // 음수인지 확인
      const maxLength = isNegative ? 17 : 16; // 음수는 17자리, 양수는 16자리 제한

      // 입력된 값이 유효할 때만 처리
      if (regex1.test(value) && value.replace(/[^0-9]/g, '').length <= maxLength) {
        // 쉼표를 제거한 순수 숫자 값
        const numericValue = value.replace(/,/g, '');

        setFormData((prev) => ({
          ...prev,
          price: numericValue === '' || numericValue === '-' ? 0 : parseFloat(numericValue),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value.trim(),
      }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!formData.product_name) newErrors.product_name = '제품명은 필수입니다.';
    if (formData.price === null || formData.price === undefined || isNaN(formData.price))
      newErrors.price = '가격은 숫자여야 합니다.';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode && !formData.product_id) {
      setErrors({ ...newErrors, product_id: 'product_id가 없습니다.' });
      return;
    }

    const response = await onSubmit(formData);
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
      localStorage.setItem('reloadProductItems', new Date().toString());
      if (window.name.startsWith('editPopup')) {
        window.close();
      } else {
        router.push('/items-list');
      }
    }
  }

  function clear() {
    setFormData({
      product_name: '',
      category: '',
      price: 0,
      manufacturer: '',
      start_date: '',
      is_use: '사용',
      description: '',
    });
    setStartDate(null);
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.title}>
        <span>{isEditMode ? '제품 수정하기' : '제품 추가하기'}</span>{' '}
        {isEditMode && (
          <button type="button" className={styles.delButton} onClick={handleDelete} title="제품 삭제">
            삭제
            <FaTrashAlt style={{ marginLeft: '0.5rem' }} />
          </button>
        )}
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="product_name" className={styles.label}>
          제품명
        </label>
        <input
          id="product_name"
          name="product_name"
          type="text"
          className={styles.input}
          required
          autoComplete="off"
          value={formData.product_name}
          title={formData.product_name}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="category" className={styles.label}>
          카테고리
        </label>
        <input
          id="category"
          name="category"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.category}
          title={formData.category}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="price" className={styles.label}>
          가격
        </label>
        <input
          id="price"
          name="price"
          type="text"
          inputMode="numeric"
          pattern="^-?\d*$"
          className={styles.input}
          autoComplete="off"
          value={formData.price === 0 ? '' : formData.price.toString()}
          title={formData.price.toString()}
          onChange={handleChange}
          placeholder="숫자와 '-'만 입력 가능합니다."
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="manufacturer" className={styles.label}>
          제조업체
        </label>
        <input
          id="manufacturer"
          name="manufacturer"
          type="text"
          className={styles.input}
          autoComplete="off"
          value={formData.manufacturer}
          title={formData.manufacturer}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="start_date" className={styles.label}>
          시작일자
        </label>
        <div className={styles.dateInput}>
          <DatePicker selectedDate={startDate} onDateChange={handleDateChange} inputId="start_date" />
        </div>
      </div>

      <div className={styles['form-row']}>
        <span className={styles.label}>사용 여부</span>
        <RadioGroup
          row
          id="is_use"
          aria-label="is_use"
          name="is_use"
          value={formData.is_use}
          onChange={handleChange}
          className={styles.radioGroup}
        >
          <FormControlLabel value="사용" control={<Radio />} label="사용" />
          <FormControlLabel value="중지" control={<Radio />} label="중지" />
        </RadioGroup>
      </div>

      <div className={styles['form-row']}>
        <label htmlFor="description" className={styles.label}>
          설명
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          autoComplete="off"
          value={formData.description}
          title={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className={styles['form-row']}>
        {errors.product_name && <span className={styles.error}>{errors.product_name}</span>}
        {errors.price && <span className={styles.error}>{errors.price}</span>}
      </div>

      <div className={styles['form-row']}>
        <button type="submit" className={styles.button}>
          {isEditMode ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}
