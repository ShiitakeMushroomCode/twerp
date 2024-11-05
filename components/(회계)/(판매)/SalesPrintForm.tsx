import { format } from 'date-fns';
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
  unit: string;
  sub_price: number;
  quantity: number;
  description: string | null;
}

export interface SalesPrintFormData {
  companyResult: CompanyResult;
  salesResult: SalesResult;
  salesItemsResult: SalesItemResult[];
}

interface Props {
  salesFormData: SalesPrintFormData;
}

export default function SalesPrintForm({ salesFormData }: Props) {
  const { companyResult, salesResult, salesItemsResult } = salesFormData;
  let totalP = 0;
  let totalPrice = 0;
  let totalSub_price = 0;
  let totalQuantity = 0;
  salesItemsResult.forEach((element) => {
    totalP += element.price;
    totalPrice += element.price * element.quantity;
    totalSub_price += element.sub_price * element.quantity;
    totalQuantity += element.quantity;
  });
  let total = totalPrice + totalSub_price;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>거래명세서</h1>
        <table>
          <tbody>
            <tr>
              <td className={styles.LLabel}>거래일자</td>
              <td>{format(new Date(salesResult.sale_date), 'yyyy년 MM월 dd일')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className={styles.infoTable}>
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
            <td className={styles.label}>상호</td>
            <td className={styles.value}>{salesResult.client_name}</td>
            <td className={styles.label}>등록번호</td>
            <td className={styles.value}>
              {companyResult.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
            </td>
          </tr>
          <tr>
            <td className={styles.label} rowSpan={2}>
              주소
            </td>
            <td className={styles.value} rowSpan={2}>
              {salesResult.client_address}
            </td>
            <td className={styles.label}>상호</td>
            <td className={styles.value}>{companyResult.company_name}</td>
          </tr>
          <tr>
            <td className={styles.label}>대표자명</td>
            <td className={styles.value}>{companyResult.representative_name}</td>
          </tr>
          <tr>
            <td className={styles.label}>전화번호</td>
            <td className={styles.value}>{salesResult.client_tel}</td>
            <td className={styles.label}>전화번호</td>
            <td className={styles.value}>{companyResult.tell_number}</td>
          </tr>
          <tr>
            <td className={styles.label}>팩스번호</td>
            <td className={styles.value}>{salesResult.client_fax}</td>
            <td className={styles.label}>팩스번호</td>
            <td className={styles.value}>{companyResult.fax_number}</td>
          </tr>
          <tr>
            <td className={styles.label}>합계금액</td>
            <td className={styles.value}>₩{total.toLocaleString()}</td>
            <td className={styles.label}>주소</td>
            <td className={styles.value}>{companyResult.business_address}</td>
          </tr>
          <tr>
            <td className={styles.label}>적요</td>
            <td colSpan={3} className={styles.value}>
              {salesResult.description}
            </td>
          </tr>
        </tbody>
      </table>

      <table className={styles.transactionTable}>
        <thead>
          <tr>
            <th>번호</th>
            <th>품목명[규격]</th>
            <th>수량[단위]</th>
            <th>단가</th>
            <th>공급가액</th>
            <th>세액</th>
            <th>적요</th>
          </tr>
        </thead>
        <tbody>
          {salesItemsResult.map((item, index) => (
            <tr key={item.sales_item_id.toString()}>
              <td>{index + 1}</td>
              <td>{`${item.product_name}${item.standard ? `[${item.standard}]` : ''}`}</td>
              <td>{`${item.quantity}${item.unit ? `[${item.unit}]` : ''}`}</td>
              <td>₩{item.price.toLocaleString()}</td>
              <td>₩{(item.price * item.quantity).toLocaleString()}</td>
              <td>₩{(item.sub_price * item.quantity).toLocaleString()}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className={styles.footerLabel}>
              합계
            </td>
            <td className={styles.footerValue}>{totalQuantity.toLocaleString()}</td>
            <td className={styles.footerValue}>₩{totalP.toLocaleString()}</td>
            <td className={styles.footerValue}>₩{totalPrice.toLocaleString()}</td>
            <td className={styles.footerValue}>₩{totalSub_price.toLocaleString()}</td>
            <td className={styles.footerValue}></td>
          </tr>
        </tfoot>
      </table>

      <table className={`${styles.transactionTable} ${styles.resultTransactionTable}`}>
        <tbody>
          <tr>
            <td className="header">공급가액</td>
            <td className="value">₩{totalPrice.toLocaleString()}</td>
            <td className="header">세액</td>
            <td className="value">₩{totalSub_price.toLocaleString()}</td>
            <td className="header">합계금액</td>
            <td className="value">₩{total.toLocaleString()}</td>
            <td className="header">인수자</td>
            <td className="value"></td>
          </tr>
        </tbody>
      </table>

      <table className={`${styles.transactionTable} ${styles.resultTransactionTable}`}>
        <tbody>
          <tr>
            <td className="header">계좌번호</td>
            <td className="value">{companyResult.account}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
