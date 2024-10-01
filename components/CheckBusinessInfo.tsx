import styles from '@/styles/BusinessForm.module.css';
import { fetchBusinessInfo } from '@/util/getBusinessInfo';

export default async function CheckBusinessInfo() {
  async function fet(formData: FormData) {
    'use server';
    const businesses = {
      businesses: [
        {
          b_no: formData.get('b_no'), // 사업자등록번호
          start_dt: formData.get('start_dt'), // 개업일자
          p_nm: formData.get('p_nm'), // 대표자성명
        },
      ],
    };
    console.log(await fetchBusinessInfo({ businesses }));
  }
  return (
    <form action={fet} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="b_no">사업자등록번호 (10자리 숫자 입력):</label>
        <input
          type="text"
          id="b_no"
          name="b_no"
          required
          minLength={10}
          maxLength={10}
          placeholder="- 없이 입력"
          pattern="\d{10}"
          title="10자리 숫자만 입력해주세요."
          autoComplete="off"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="p_nm">대표자성명 (외국인은 영어로 입력):</label>
        <input
          type="text"
          id="p_nm"
          name="p_nm"
          required
          pattern="[A-Za-z가-힣 ]+"
          title="영어 또는 한글만 입력해주세요."
          autoComplete="off"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="start_dt">개업일자 (필수):</label>
        <input
          type="text"
          id="start_dt"
          name="start_dt"
          required
          placeholder="예시) 20000101"
          pattern="[A-Za-z가-힣 ]+"
          title="영어 또는 한글만 입력해주세요."
          autoComplete="off"
        />
      </div>

      <button type="submit" className={styles.button}>
        제출
      </button>
    </form>
  );
}
