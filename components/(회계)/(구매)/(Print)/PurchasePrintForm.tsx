import { format } from 'date-fns';
import styles from './PurchasePrintForm.module.css';

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

export interface PurchasesResult {
  purchase_id: Buffer;
  company_id: Buffer;
  supplier_id: Buffer | null;
  supplier_name: string | null;
  supplier_address: string | null;
  supplier_tel: string | null;
  supplier_fax: string | null;
  purchase_date: string;
  description: string | null;
  transaction_type: '카드결제' | '현금결제' | '계좌이체' | '기타';
  collection: '완료' | '진행중';
  update_at: string;
}

export interface PurchaseItemResult {
  purchase_item_id: Buffer;
  purchase_id: Buffer;
  product_id: string | null;
  product_name: string;
  standard: string | null;
  price: number;
  sub_price: number;
  quantity: number;
  unit: string | null;
  description: string | null;
}

export interface PurchasesPrintFormData {
  companyResult: CompanyResult;
  purchasesResult: PurchasesResult;
  purchaseItemsResult: PurchaseItemResult[];
}

interface Props {
  purchasesFormData: PurchasesPrintFormData;
}

export default function PurchasesPrintFormComponent({ purchasesFormData }: Props) {
  const { companyResult, purchasesResult, purchaseItemsResult } = purchasesFormData;
  let totalP = 0;
  let totalPrice = 0;
  let totalSub_price = 0;
  let totalQuantity = 0;

  purchaseItemsResult.forEach((element) => {
    totalP += element.price;
    totalPrice += element.price * element.quantity;
    totalSub_price += element.sub_price;
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
              <td>
                {purchasesResult?.purchase_date
                  ? format(new Date(purchasesResult.purchase_date), 'yyyy년 MM월 dd일')
                  : '날짜 없음'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className={styles.infoTable}>
        <thead>
          <tr>
            <th colSpan={2} className={styles.subTitle}>
              공급자 정보
            </th>
            <th colSpan={2} className={styles.subTitle}>
              공급받는자 정보
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.label}>상호</td>
            <td className={styles.value}>{purchasesResult.supplier_name}</td>
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
              {purchasesResult.supplier_address}
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
            <td className={styles.value}>{purchasesResult.supplier_tel}</td>
            <td className={styles.label}>전화번호</td>
            <td className={styles.value}>{companyResult.tell_number}</td>
          </tr>
          <tr>
            <td className={styles.label}>팩스번호</td>
            <td className={styles.value}>{purchasesResult.supplier_fax}</td>
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
              {purchasesResult.description}
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
          {purchaseItemsResult.map((item, index) => (
            <tr key={item.purchase_item_id.toString()}>
              <td style={{ width: '5%', whiteSpace: 'normal', overflowWrap: 'break-word' }}>{index + 1}</td>
              <td style={{ width: '17%', whiteSpace: 'normal', overflowWrap: 'break-word' }}>{`${item.product_name}${
                item.standard ? `[${item.standard}]` : ''
              }`}</td>
              <td
                style={{ width: '12%', whiteSpace: 'normal', overflowWrap: 'break-word' }}
              >{`${item.quantity.toLocaleString()}${item.unit ? `[${item.unit}]` : ''}`}</td>
              <td style={{ width: '12%', whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'right' }}>
                ₩{item.price.toLocaleString()}
              </td>
              <td style={{ width: '20%', whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'right' }}>
                ₩{(item.price * item.quantity).toLocaleString()}
              </td>
              <td style={{ width: '15%', whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'right' }}>
                ₩{item.sub_price.toLocaleString()}
              </td>
              <td style={{ width: '19%', whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'left' }}>
                {item.description}
              </td>
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
            <td className='header'>공급가액</td>
            <td className='value'>₩{totalPrice.toLocaleString()}</td>
            <td className='header'>세액</td>
            <td className='value'>₩{totalSub_price.toLocaleString()}</td>
            <td className='header'>합계금액</td>
            <td className='value'>₩{total.toLocaleString()}</td>
            <td className='header'>인수자</td>
            <td className='value'></td>
          </tr>
        </tbody>
      </table>

      <table className={`${styles.transactionTable} ${styles.resultTransactionTable}`}>
        <tbody>
          <tr>
            <td className='header'>계좌번호</td>
            <td className='value'>{companyResult.account}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
