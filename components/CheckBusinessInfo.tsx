import styles from '@/styles/BusinessForm.module.css';

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
    console.log(businesses);
    try {
      const response = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.BUSINESS_INFO_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(businesses),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      const validValue = jsonResponse.data[0].valid;
      console.log(validValue === '01' ? true : false);
    } catch (error) {
      console.error('Error:', error);
    }

    // 사업자 상태 확인
    const b_nos = {
      b_no: [formData.get('b_no')],
    };
    console.log(b_nos);
    try {
      const response = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.BUSINESS_INFO_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(b_nos),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error('Error:', error);
    }
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
          pattern="\d{8}"
          title="8자리 숫자만 입력해주세요."
          autoComplete="off"
        />
      </div>

      <button type="submit" className={styles.button}>
        제출
      </button>
    </form>
  );
}
