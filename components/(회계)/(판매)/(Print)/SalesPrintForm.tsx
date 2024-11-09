/** @jsxImportSource @emotion/react */
'use client';
import { css } from '@emotion/react';
import { format } from 'date-fns';
import React from 'react';

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


const containerStyle = css`
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 100%;
  max-width: 1078px;
  margin: 0 auto;
  background-color: #ffffff;
  font-size: small;
  width: auto;
`;

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  padding-bottom: 5px;
  margin-bottom: 16px;
`;

const titleStyle = css`
  margin-left: 1rem;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const subTitleStyle = css`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  padding: 8px;
  text-align: center;
  background-color: #f0f0f0;
`;

const infoTableStyle = css`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border: 1px solid black;

  th,
  td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .label {
    width: 20%;
    font-weight: bold;
    text-align: center;
  }

  .value {
    width: 30%;
    text-align: left;
  }

  .LLabel {
    padding-right: 1rem;
    font-weight: bold;
  }

  .longLabel {
    width: 30%;
    font-weight: bold;
  }

  .shortLabel {
    width: 10%;
    font-weight: bold;
  }

  .footerLabel {
    font-weight: bold;
    background-color: #f9f9f9;
    text-align: right;
    border-top: 2px solid black;
  }

  .footerValue {
    font-weight: bold;
    background-color: #f9f9f9;
    text-align: right;
    border-top: 2px solid black;
  }
`;

const transactionTableStyle = css`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  border: 1px solid black;

  th,
  td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .resultTransactionTable tr td {
    padding-left: 0;
    padding-right: 0;
    margin-left: 0;
    margin-right: 0;
  }

  .resultTransactionTable tr td:nth-of-type(even) {
    width: 12%;
  }

  .resultTransactionTable tr td:nth-of-type(odd) {
    background-color: #f0f0f0;
    width: 8%;
  }

  .resultTransactionTable tr td.header {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .resultTransactionTable tr td.value {
    text-align: right;
  }
`;

const resultTransactionTableStyle = css`
  ${transactionTableStyle}
`;

// 새로운 스타일 추가
const accountNumberStyle = css`
  width: 30%;
  font-weight: bold;
  text-align: center;
`;

const smallTextStyle = css`
  font-size: 12px; /* 원하는 크기로 조정 */
  font-weight: bold;
  background-color: #f9f9f9;
  text-align: center;
  border-top: 2px solid black;
`;

const SalesPrintFormComponent: React.FC<any> = ({ salesFormData }) => {
  const { companyResult, salesResult, salesItemsResult } = salesFormData;
  let totalP = 0;
  let totalPrice = 0;
  let totalSub_price = 0;
  let totalQuantity = 0;

  salesItemsResult.forEach((element:any) => {
    totalP += element.price;
    totalPrice += element.price * element.quantity;
    totalSub_price += element.sub_price;
    totalQuantity += element.quantity;
  });

  let total = totalPrice + totalSub_price;

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <h1 css={titleStyle}>거래명세서</h1>
        <table>
          <tbody>
            <tr>
              <td
                css={css`
                  padding-right: 1rem;
                  font-weight: bold;
                `}
              >
                거래일자
              </td>
              <td>
                {salesResult?.sale_date ? format(new Date(salesResult.sale_date), 'yyyy년 MM월 dd일') : '날짜 없음'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <table css={infoTableStyle}>
        <thead>
          <tr>
            <th colSpan={2} css={subTitleStyle}>
              공급받는자 정보
            </th>
            <th colSpan={2} css={subTitleStyle}>
              공급자 정보
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              css={css`
                width: 15%;
                font-weight: bold;
                text-align: center;
              `}
            >
              상호
            </td>
            <td
              css={css`
                width: 35%;
                text-align: left;
              `}
            >
              {salesResult.client_name}
            </td>
            <td
              css={css`
                width: 15%;
                font-weight: bold;
                text-align: center;
              `}
            >
              등록번호
            </td>
            <td
              css={css`
                width: 35%;
                text-align: center;
              `}
            >
              {companyResult.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                padding-right: 1rem;
                font-weight: bold;
              `}
              rowSpan={2}
            >
              주소
            </td>
            <td
              css={css`
                text-align: left;
              `}
              rowSpan={2}
            >
              {salesResult.client_address}
            </td>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              상호
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {companyResult.company_name}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              대표자명
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {companyResult.representative_name}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              전화번호
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {salesResult.client_tel}
            </td>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              전화번호
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {companyResult.tell_number}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              팩스번호
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {salesResult.client_fax}
            </td>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              팩스번호
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {companyResult.fax_number}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              합계금액
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              ₩{total.toLocaleString()}
            </td>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              주소
            </td>
            <td
              css={css`
                text-align: left;
              `}
            >
              {companyResult.business_address}
            </td>
          </tr>
          <tr>
            <td
              css={css`
                font-weight: bold;
                text-align: center;
              `}
            >
              적요
            </td>
            <td
              colSpan={3}
              css={css`
                text-align: left;
              `}
            >
              {salesResult.description}
            </td>
          </tr>
        </tbody>
      </table>

      <table css={transactionTableStyle}>
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
            <tr key={item.sales_item_id}>
              <td>{index + 1}</td>
              <td>{`${item.product_name}${item.standard ? `[${item.standard}]` : ''}`}</td>
              <td>{`${item.quantity.toLocaleString()}${item.unit ? `[${item.unit}]` : ''}`}</td>
              <td>₩{item.price.toLocaleString()}</td>
              <td>₩{(item.price * item.quantity).toLocaleString()}</td>
              <td>₩{item.sub_price.toLocaleString()}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={2}
              css={css`
                font-weight: bold;
                background-color: #f9f9f9;
                text-align: right;
                border-top: 2px solid black;
              `}
            >
              합계
            </td>
            <td css={smallTextStyle}>{totalQuantity.toLocaleString()}</td>
            <td css={smallTextStyle}>₩{totalP.toLocaleString()}</td>
            <td css={smallTextStyle}>₩{totalPrice.toLocaleString()}</td>
            <td css={smallTextStyle}>₩{totalSub_price.toLocaleString()}</td>
            <td css={smallTextStyle}></td>
          </tr>
        </tfoot>
      </table>

      <table css={[transactionTableStyle, resultTransactionTableStyle]}>
        <tbody>
          <tr>
            <td
              css={css`
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                width: 8%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              공급가액
            </td>
            <td
              css={css`
                background-color: #ffffff;
                font-weight: bold;
                text-align: center;
                width: 12%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              ₩{totalPrice.toLocaleString()}
            </td>
            <td
              css={css`
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                width: 8%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              세액
            </td>
            <td
              css={css`
                background-color: #ffffff;
                font-weight: bold;
                text-align: center;
                width: 12%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              ₩{totalSub_price.toLocaleString()}
            </td>
            <td
              css={css`
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                width: 8%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              합계금액
            </td>
            <td
              css={css`
                background-color: #ffffff;
                font-weight: bold;
                text-align: center;
                width: 12%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              ₩{total.toLocaleString()}
            </td>
            <td
              css={css`
                background-color: #f0f0f0;
                font-weight: bold;
                text-align: center;
                width: 8%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            >
              인수자
            </td>
            <td
              css={css`
                background-color: #ffffff;
                font-weight: bold;
                text-align: center;
                width: 12%;
                margin-left: 0;
                margin-right: 0;
                padding-left: 0;
                padding-right: 0;
                font-size: x-small;
                white-space: nowrap;
              `}
            ></td>
          </tr>
        </tbody>
      </table>

      <table css={[transactionTableStyle, resultTransactionTableStyle]}>
        <tbody>
          <tr>
            <td css={accountNumberStyle}>계좌번호</td>
            <td
              css={css`
                text-align: right;
              `}
            >
              {companyResult.account}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SalesPrintFormComponent;
