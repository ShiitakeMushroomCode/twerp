import styles from './temp.module.css';
export default function table() {
  return (
    <table className={styles.infoTable}>
      <colgroup>
        <col style={{ width: '15%' }} />
        <col style={{ width: '35%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '35%' }} />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={2} className={styles.subTitle}>
            공급받는자 정보
          </th>
          <th colSpan={2} className={styles.subTitle}>
            공급자 정보
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.infoTableLabel}>상호</td>
          <td className={styles.infoTableValue}>{''}</td>
          <td className={styles.infoTableLabel}>등록번호</td>
          <td className={styles.infoTableValue}>{''.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</td>
        </tr>
        <tr>
          <td className={styles.infoTableLabel} rowSpan={2}>
            주소
          </td>
          <td className={styles.infoTableValue} rowSpan={2}>
            {''}
          </td>
          <td className={styles.infoTableLabel}>상호</td>
          <td className={styles.infoTableValue}>{''}</td>
        </tr>
        <tr>
          <td className={styles.infoTableLabel}>대표자명</td>
          <td className={styles.infoTableValue}>{''}</td>
        </tr>
        <tr>
          <td className={styles.infoTableLabel}>전화번호</td>
          <td className={styles.infoTableValue}>{''}</td>
          <td className={styles.infoTableLabel}>전화번호</td>
          <td className={styles.infoTableValue}>{''}</td>
        </tr>
        <tr>
          <td className={styles.infoTableLabel}>팩스번호</td>
          <td className={styles.infoTableValue}>{''}</td>
          <td className={styles.infoTableLabel}>팩스번호</td>
          <td className={styles.infoTableValue}>{''}</td>
        </tr>
        <tr>
          <td className={styles.infoTableLabel}>합계금액</td>
          <td className={styles.infoTableValue}>₩{''.toLocaleString()}</td>
          <td className={styles.infoTableLabel}>주소</td>
          <td className={styles.infoTableValue}>{''}</td>
        </tr>
      </tbody>
    </table>
  );
}
