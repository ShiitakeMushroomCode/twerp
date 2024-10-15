import styles from '@/styles/client-add.module.css';
export const metadata = {
  title: '거래처 추가하기',
};
async function AddClient(formData: FormData) {
  'use server';
  // 값 필터링 필요함
  const [b_no, start_dt, p_nm] = [
    formData.get('business_number'),
    formData.get('start_date'),
    formData.get('representative_name'),
  ];
  const businesses = {
    businesses: [
      {
        b_no: b_no, // 사업자등록번호
        start_dt: start_dt, // 개업일자
        p_nm: p_nm, // 대표자성명
      },
    ],
  };
  console.log(businesses);

  // 제대로된 사업자인지 확인
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
}
export default async function Page() {
  return (
    <div>
      <form action={AddClient} className={styles.form}>
        <div className={styles.title}>거래처 추가하기</div>
        <div className={styles['form-row']}>
          <label htmlFor="business_number" className={styles.label}>
            사업자번호
          </label>
          <input
            id="business_number"
            name="business_number"
            type="text"
            title="사업자번호"
            className={styles.input}
            required
            autoComplete="off"
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
            title="상호"
            className={styles.input}
            required
            autoComplete="off"
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
            title="대표자명"
            className={styles.input}
            required
            autoComplete="off"
          />
        </div>

        <div className={styles['form-row']}>
          <label htmlFor="start_date" className={styles.label}>
            개업일자
          </label>
          <input
            id="start_date"
            name="start_date"
            type="text"
            title="개업일자"
            className={styles.input}
            required
            autoComplete="off"
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
            title="업태"
            className={styles.input}
            autoComplete="off"
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
            title="주종목명"
            className={styles.input}
            autoComplete="off"
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
            title="주소"
            className={styles.input}
            autoComplete="off"
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
            title="대표번호"
            className={styles.input}
            autoComplete="off"
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
            title="팩스번호"
            className={styles.input}
            autoComplete="off"
          />
        </div>

        <div className={styles['form-row']}>
          <label htmlFor="billing_email" className={styles.label}>
            이메일
          </label>
          <input
            id="billing_email"
            name="billing_email"
            type="text"
            title="세금계산서 이메일"
            className={styles.input}
            autoComplete="off"
          />
        </div>

        <button type="submit" className={styles.button}>
          등록
        </button>
      </form>
    </div>
  );
}
