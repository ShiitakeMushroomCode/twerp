'use client'
import { format } from 'date-fns';
import styled from 'styled-components';

export interface CompanyResult {
  company_id: string;
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
  sales_id: string;
  company_id: string;
  client_id: string | null;
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
  sales_item_id: string;
  sales_id: string;
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


// Styled Components 정의
const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  color: #333;
  padding: 20px;
  background-color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #000;
  padding-bottom: 8px;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
`;

const InfoTh = styled.th`
  background-color: #f0f0f0;
  font-weight: bold;
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
`;

const InfoTd = styled.td`
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
`;

const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
`;

const TransactionTh = styled.th`
  background-color: #f0f0f0;
  font-weight: bold;
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
`;

const TransactionTd = styled.td<{ isHeader?: boolean; isValue?: boolean }>`
  border: 1px solid #000;
  padding: 8px;
  text-align: center;

  ${(props) =>
    props.isHeader &&
    `
    background-color: #f0f0f0;
    font-weight: bold;
  `}

  ${(props) =>
    props.isValue &&
    `
    text-align: right;
  `}
`;

const FooterLabel = styled.td`
  font-weight: bold;
  background-color: #f9f9f9;
  text-align: right;
  border-top: 2px solid #000;
`;

const FooterValue = styled.td`
  font-weight: bold;
  background-color: #f9f9f9;
  text-align: right;
  border-top: 2px solid #000;
`;

export default function EmailSalesInvoice({ salesFormData }) {
  const { companyResult, salesResult, salesItemsResult } = salesFormData;
  let totalP = 0;
  let totalPrice = 0;
  let totalSub_price = 0;
  let totalQuantity = 0;

  salesItemsResult.forEach((element) => {
    totalP += element.price;
    totalPrice += element.price * element.quantity;
    totalSub_price += element.sub_price;
    totalQuantity += element.quantity;
  });

  const total = totalPrice + totalSub_price;

  return (
    <Container>
      <Header>
        <Title>거래명세서</Title>
        <div>
          거래일자: {salesResult.sale_date ? format(new Date(salesResult.sale_date), 'yyyy년 MM월 dd일') : '날짜 없음'}
        </div>
      </Header>

      <InfoTable>
        <thead>
          <tr>
            <InfoTh colSpan={2}>공급받는자 정보</InfoTh>
            <InfoTh colSpan={2}>공급자 정보</InfoTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <InfoTh>상호</InfoTh>
            <InfoTd>{salesResult.client_name}</InfoTd>
            <InfoTh>등록번호</InfoTh>
            <InfoTd>
              {companyResult.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
            </InfoTd>
          </tr>
          <tr>
            <InfoTh rowSpan={2}>주소</InfoTh>
            <InfoTd rowSpan={2}>{salesResult.client_address}</InfoTd>
            <InfoTh>상호</InfoTh>
            <InfoTd>{companyResult.company_name}</InfoTd>
          </tr>
          <tr>
            <InfoTh>대표자명</InfoTh>
            <InfoTd>{companyResult.representative_name}</InfoTd>
          </tr>
          <tr>
            <InfoTh>전화번호</InfoTh>
            <InfoTd>{salesResult.client_tel}</InfoTd>
            <InfoTh>전화번호</InfoTh>
            <InfoTd>{companyResult.tell_number}</InfoTd>
          </tr>
          <tr>
            <InfoTh>팩스번호</InfoTh>
            <InfoTd>{salesResult.client_fax}</InfoTd>
            <InfoTh>팩스번호</InfoTh>
            <InfoTd>{companyResult.fax_number}</InfoTd>
          </tr>
          <tr>
            <InfoTh>합계금액</InfoTh>
            <InfoTd>₩{total.toLocaleString()}</InfoTd>
            <InfoTh>주소</InfoTh>
            <InfoTd>{companyResult.business_address}</InfoTd>
          </tr>
          <tr>
            <InfoTh>적요</InfoTh>
            <InfoTd colSpan={3}>{salesResult.description}</InfoTd>
          </tr>
        </tbody>
      </InfoTable>

      <TransactionTable>
        <thead>
          <tr>
            <TransactionTh>번호</TransactionTh>
            <TransactionTh>품목명[규격]</TransactionTh>
            <TransactionTh>수량[단위]</TransactionTh>
            <TransactionTh>단가</TransactionTh>
            <TransactionTh>공급가액</TransactionTh>
            <TransactionTh>세액</TransactionTh>
            <TransactionTh>적요</TransactionTh>
          </tr>
        </thead>
        <tbody>
          {salesItemsResult.map((item, index) => (
            <tr key={item.sales_item_id}>
              <TransactionTd>{index + 1}</TransactionTd>
              <TransactionTd>{`${item.product_name}${item.standard ? ` [${item.standard}]` : ''}`}</TransactionTd>
              <TransactionTd>{`${item.quantity.toLocaleString()} ${item.unit}`}</TransactionTd>
              <TransactionTd>₩{item.price.toLocaleString()}</TransactionTd>
              <TransactionTd>₩{(item.price * item.quantity).toLocaleString()}</TransactionTd>
              <TransactionTd>₩{item.sub_price.toLocaleString()}</TransactionTd>
              <TransactionTd>{item.description}</TransactionTd>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <FooterLabel colSpan={2}>합계</FooterLabel>
            <FooterValue>{totalQuantity.toLocaleString()}</FooterValue>
            <FooterValue>₩{totalP.toLocaleString()}</FooterValue>
            <FooterValue>₩{totalPrice.toLocaleString()}</FooterValue>
            <FooterValue>₩{totalSub_price.toLocaleString()}</FooterValue>
            <FooterValue></FooterValue>
          </tr>
        </tfoot>
      </TransactionTable>

      <TransactionTable>
        <tbody>
          <tr>
            <TransactionTd className="header">공급가액</TransactionTd>
            <TransactionTd className="value">₩{totalPrice.toLocaleString()}</TransactionTd>
            <TransactionTd className="header">세액</TransactionTd>
            <TransactionTd className="value">₩{totalSub_price.toLocaleString()}</TransactionTd>
            <TransactionTd className="header">합계금액</TransactionTd>
            <TransactionTd className="value">₩{total.toLocaleString()}</TransactionTd>
            <TransactionTd className="header">인수자</TransactionTd>
            <TransactionTd className="value"></TransactionTd>
          </tr>
        </tbody>
      </TransactionTable>

      <TransactionTable>
        <tbody>
          <tr>
            <TransactionTd className="header">계좌번호</TransactionTd>
            <TransactionTd className="value">{companyResult.account}</TransactionTd>
          </tr>
        </tbody>
      </TransactionTable>
    </Container>
  );
}
