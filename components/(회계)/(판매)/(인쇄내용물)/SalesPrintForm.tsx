import styles from './SalesPrintForm.module.css';
export interface CompanyResult {
  company_id: Buffer;
  business_number: string;
  company_name: string;
  representative_name: string;
  business_address: string;
  billing_email: string;
  tell_number: string;
  fax_number: string;
  start_date: string;
  business_status: string | null;
  main_item_name: string | null;
  description: string | null;
  account: string;
}

export interface SalesResult {
  sales_id: Buffer;
  company_id: Buffer;
  business_number: string;
  client_id: Buffer | null;
  client_name: string | null;
  client_address: string | null;
  client_tel: string | null;
  client_fax: string | null;
  sale_date: string;
  description: string | null;
  transaction_type: '카드결제' | '현금결제' | '계좌이체' | '기타';
  collection: '완료' | '진행중';
  client_staff_name: string | null;
  client_staff_contact_info: string | null;
  update_at: string;
}

export interface SalesItemResult {
  sales_item_id: Buffer;
  sales_id: Buffer;
  product_id: string | null;
  product_name: string;
  standard: string | null;
  price: number;
  sub_price: number;
  quantity: number;
  description: string | null;
}

export interface SalesFormData {
  companyResult: CompanyResult;
  salesResult: SalesResult;
  salesItemsResult: SalesItemResult[];
  sequence_number: string;
}
interface Props {
  salesFormData: SalesFormData;
}

export default function SalesPrintForm({ salesFormData }: Props) {
  const { companyResult, salesResult, salesItemsResult, sequence_number } = salesFormData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>거래명세서</h1>
      </div>
      <h1 className={styles.subTitle}>판매자 정보</h1>
      <div className={styles.subdetails}>
        <div className={styles.row}>
          <div className={styles.label}>사업자등록번호</div>
          <div className={styles.value}>{companyResult['business_number']}</div>
          <div className={styles.shortLabel}>📞TEL</div>
          <div className={styles.value}>{companyResult['tell_number']}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>상호</div>
          <div className={styles.value}>{companyResult['company_name']}</div>
          <div className={styles.shortLabel}>대표자명</div>
          <div className={styles.value}>{companyResult['representative_name']}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>주소</div>
          <div className={styles.longValue}>{companyResult['business_address']}</div>
        </div>
      </div>
      <h1 className={styles.subTitle}>구매자 정보</h1>
      <div className={styles.subdetails}>
        <div className={styles.row}>
          <div className={styles.label}>사업자등록번호</div>
          <div className={styles.value}>{salesResult['business_number']}</div>
          <div className={styles.label}>📞TEL</div>
          <div className={styles.value}>{salesResult['client_tel']}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>상호</div>
          <div className={styles.value}>{salesResult['client_name']}</div>
          <div className={styles.shortLabel}>📠FAX</div>
          <div className={styles.value}>{salesResult['client_fax']}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>주소</div>
          <div className={styles.longValue}>{salesResult['client_address']}</div>
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
          </tbody>
        </table>
      </div>
      <div className={styles.amountDetails}>
        <div className={styles.longLabel}>금액 (부가가치세 포함)</div>
        <div className={styles.longValue}>₩1,200,000</div>
      </div>
      <div className={styles.accountDetails}>
        <div className={styles.longLabel}>계좌번호</div>
        <div className={styles.longValue}>{companyResult['account']}</div>
      </div>
    </div>
  );
}
