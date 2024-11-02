import BusinessInfoTable from '@/components/(회계)/(판매)/(인쇄내용물)/BusinessInfoTable';
import ClientInfo from '@/components/(회계)/(판매)/(인쇄내용물)/ClientInfo';
import { formatDateWithSequence } from '@/util/reform';
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
      <div className={styles.half}>
        <ClientInfo
          client_address={salesResult['client_address']}
          client_fax={salesResult['client_fax']}
          client_name={salesResult['client_name']}
          client_tel={salesResult['client_tel']}
        />
      </div>
      <div className={styles.half}>
        <BusinessInfoTable
          company_name={companyResult['company_name']}
          serialDate={formatDateWithSequence(salesResult['sale_date'], Number.parseInt(sequence_number))}
          tellNumber={companyResult['tell_number']}
          address={companyResult['business_address']}
          business_number={companyResult['business_number']}
          representative_name={companyResult['representative_name']}
        />
      </div>
    </div>
  );
}
