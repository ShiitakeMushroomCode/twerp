'use client';
import styles from './BusinessInfoTable.module.css';

export default function BusinessInfoTable({
  company_name,
  serialDate,
  tellNumber,
  address,
  business_number,
  representative_name,
}) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td rowSpan={4} className={styles.title}>
              공급자
            </td>
            <td className={styles.cell}>일련번호</td>
            <td className={styles.cellContent}>{serialDate}</td>
            <td className={styles.cell}>TEL</td>
            <td className={styles.cellContent}>{tellNumber}</td>
          </tr>
          <tr>
            <td className={styles.cell}>사업자등록번호</td>
            <td className={styles.cellContent}>{business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</td>
            <td className={styles.cell}>성명</td>
            <td className={styles.cellContent}>{representative_name}</td>
          </tr>
          <tr>
            <td className={styles.cell}>상호</td>
            <td className={styles.cellContent} colSpan={3}>
              {company_name}
            </td>
          </tr>
          <tr>
            <td className={styles.cell}>주소</td>
            <td className={styles.cellContent} colSpan={3}>
              {address}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
