import styles from './test.module.css';

export default function TransactionStatement() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>거래명세서</h1>
      </div>
      <h1 className={styles.subTitle}>판매자 정보</h1>
      <div className={styles.details}>
        <div className={styles.row}>
          <div className={styles.label}>사업자등록번호</div>
          <div className={styles.value}>589-72-75625</div>
          <div className={styles.shortLabel}>📞TEL</div>
          <div className={styles.value}>019-617-3937</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>상호</div>
          <div className={styles.value}>SK텔레콤</div>
          <div className={styles.shortLabel}>대표자명</div>
          <div className={styles.value}>김상훈</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>주소</div>
          <div className={styles.longValue}>충청북도 하남시 역삼길 (정순허길리)</div>
        </div>
      </div>
      <h1 className={styles.subTitle}>구매자 정보</h1>
      <div className={styles.details}>
        <div className={styles.row}>
          <div className={styles.label}>사업자등록번호</div>
          <div className={styles.value}>589-72-75625</div>
          <div className={styles.shortLabel}>📞TEL</div>
          <div className={styles.value}>019-617-3937</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>상호</div>
          <div className={styles.value}>SK텔레콤</div>
          <div className={styles.shortLabel}>대표자명</div>
          <div className={styles.value}>김상훈</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>주소</div>
          <div className={styles.longValue}>충청북도 하남시 역삼길 (정순허길리)</div>
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.transactionTable}>
          <thead>
            <tr>
              <th>번호</th>
              <th>품목명</th>
              <th>수량</th>
              <th>단가</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>상품 A</td>
              <td>10</td>
              <td>₩100,000</td>
              <td>₩1,000,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>상품 B</td>
              <td>2</td>
              <td>₩100,000</td>
              <td>₩200,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={styles.amountDetails}>
        <div className={styles.longLabel}>금액 (부가가치세 포함)</div>
        <div className={styles.longValue}>₩1,200,000</div>
      </div>
      <div className={styles.accountDetails}>
        <div className={styles.longLabel}>계좌번호</div>
        <div className={styles.longValue}>국민은행 123-4567-8910</div>
      </div>
    </div>
  );
}
