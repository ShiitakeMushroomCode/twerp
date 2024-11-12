'use server';

import {
  PurchaseItemResult,
  PurchasesPrintFormData,
  PurchasesResult,
} from '@/components/(회계)/(구매)/(Print)/PurchasePrintForm';
import {
  CompanyResult,
  SalesItemResult,
  SalesPrintFormData,
  SalesResult,
} from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { executeQuery } from '@/lib/db';
import puppeteer from 'puppeteer';

export async function fetchPurchasesData(id: string, companyIdData: string): Promise<PurchasesPrintFormData> {
  const companyIdBuffer = Buffer.from(companyIdData, 'hex');
  const purchaseIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, purchasesResult, purchaseItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM purchases WHERE purchase_id = ?', [purchaseIdBuffer]),
    executeQuery('SELECT * FROM purchase_items WHERE purchase_id = ?', [purchaseIdBuffer]),
  ]);

  return {
    companyResult: transformBufferFields<CompanyResult>(companyResult[0]),
    purchasesResult: transformBufferFields<PurchasesResult>(purchasesResult[0]),
    purchaseItemsResult: purchaseItemsResult.map((item) => transformBufferFields<PurchaseItemResult>(item)),
  };
}

export async function fetchSalesData(id: string, companyIdData: string): Promise<SalesPrintFormData> {
  const companyIdBuffer = Buffer.from(companyIdData, 'hex');
  const salesIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, salesResult, salesItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
  ]);
  return {
    companyResult: transformBufferFields<CompanyResult>(companyResult[0]),
    salesResult: transformBufferFields<SalesResult>(salesResult[0]),
    salesItemsResult: salesItemsResult.map((item) => transformBufferFields<SalesItemResult>(item)),
  };
}

function transformBufferFields<T>(data: Record<string, any>): T {
  const transformedData: Record<string, any> = {};
  for (const key in data) {
    transformedData[key] = Buffer.isBuffer(data[key]) ? data[key].toString('hex') : data[key];
  }
  return transformedData as T;
}

export async function generatePdf(id: string, companyIdData = null, option: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  if (option.startsWith('SendMailS')) {
    await page.setContent(generateSaleEmailHtml(await fetchSalesData(id, companyIdData)), {
      waitUntil: 'networkidle2',
      timeout: 3000,
    });
  }
  if (option.startsWith('SendMailP')) {
    await page.setContent(generatePurchaseEmailHtml(await fetchPurchasesData(id, companyIdData)), {
      waitUntil: 'networkidle2',
      timeout: 3000,
    });
  }

  const pdfBuffer = Buffer.from(
    await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    })
  ) as Buffer;
  await browser.close();
  return pdfBuffer;
}

export async function generatePdfBase64(id: string, companyIdData = null, option): Promise<string> {
  const pdfBase64 = (await generatePdf(id, companyIdData, option)) as Buffer;
  return pdfBase64.toString('base64');
}

function generateSaleEmailHtml(data) {
  const { companyResult, salesResult, salesItemsResult } = data;

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
  let total = totalPrice + totalSub_price;

  return `
    <div style="display: flex; flex-direction: column; padding: 16px; width: 100%; max-width: 1078px; margin: 0 auto; background-color: #ffffff; font-size: small; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 16px;">
        <h1 style="margin-left: 1rem; font-size: 28px; font-weight: bold; margin-bottom: 10px;">거래명세서</h1>
        <div style="width: 50%; text-align: right; font-size:1rem;">
            <span style="padding-right: 1rem; font-weight: bold;">거래일자</span>
            <span>${salesResult.sale_date ? new Date(salesResult.sale_date).toLocaleDateString() : '날짜 없음'}</span>
        </div>          
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid black;">
        <thead>
          <tr>
            <th colspan="2" style="font-size: 20px; font-weight: bold; padding: 8px; text-align: center; background-color: #f0f0f0; border: 1px solid black;">공급받는자 정보</th>
            <th colspan="2" style="font-size: 20px; font-weight: bold; padding: 8px; text-align: center; background-color: #f0f0f0; border: 1px solid black;">공급자 정보</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">상호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; white-space: nowrap; text-align: center; border: 1px solid black;">${
              salesResult.client_name ? salesResult.client_name : ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">등록번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; white-space: nowrap; text-align: center; border: 1px solid black;">${
              companyResult.business_number
                ? companyResult.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
                : ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;" rowspan="2">주소</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;" rowspan="2">${
              salesResult.client_address || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">상호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.company_name || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">대표자명</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.representative_name || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">전화번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              salesResult.client_tel || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">전화번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.tell_number || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">팩스번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              salesResult.client_fax || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">팩스번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.fax_number || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">합계금액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">₩${
              total ? total.toLocaleString() : ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">주소</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.business_address || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 20%; font-weight: bold; text-align: center; border: 1px solid black;">적요</td>
            <td colspan="3" style="padding-top: 3px; padding-bottom: 3px; width: 80%; text-align: center; border: 1px solid black;">${
              salesResult.description || ''
            }</td>
          </tr>
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid black; font-size: small;">
        <thead>
          <tr>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">번호</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">품목명[규격]</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">수량[단위]</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">단가</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">공급가액</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">세액</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">적요</th>
          </tr>
        </thead>
        <tbody>
          ${salesItemsResult
            .map(
              (item, index) => `
            <tr>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 5%; text-align: center; border: 1px solid black;">${
                index + 1
              }</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 17%; text-align: center; border: 1px solid black;">${
                item.product_name
              }${item.standard ? `[${item.standard}]` : ''}</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 12%; text-align: center; border: 1px solid black;">${item.quantity.toLocaleString()}${
                item.unit ? `[${item.unit}]` : ''
              }</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 12%; text-align: right; border: 1px solid black;">₩${item.price.toLocaleString()}</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 20%; text-align: right; border: 1px solid black;">₩${(
                item.price * item.quantity
              ).toLocaleString()}</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 15%; text-align: right; border: 1px solid black;">₩${item.sub_price.toLocaleString()}</td>
              <td style="padding-top: 2px; padding-bottom: 2px; width: 19%; text-align: center; border: 1px solid black;">${
                item.description || ''
              }</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">합계</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">${totalQuantity.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalP.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalPrice.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalSub_price.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;"></td>
          </tr>
        </tfoot>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid black; font-size: small;">
        <tbody>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">공급가액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${totalPrice.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">세액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${totalSub_price.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">합계금액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${total.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">인수자</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; border: 1px solid black;"></td>
          </tr>          
        </tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid black;"><tr>
          <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; text-align: center; width: 20%; background-color: #f0f0f0; border: 1px solid black;">계좌번호</td>
          <td colspan="7" style="padding-top: 3px; padding-bottom: 3px; text-align: right; border: 1px solid black;">${
            companyResult.account ? companyResult.account : ''
          }</td>
          </tr>
      </tbody>
    </div>
  `;
}

function generatePurchaseEmailHtml(data) {
  const { companyResult, purchasesResult, purchaseItemsResult } = data;

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

  return `
    <div style="display: flex; flex-direction: column; padding: 16px; width: 100%; max-width: 1078px; margin: 0 auto; background-color: #ffffff; font-size: small; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 16px;">
        <h1 style="margin-left: 1rem; font-size: 28px; font-weight: bold; margin-bottom: 10px;">구매명세서</h1>
        <div style="width: 50%; text-align: right; font-size:1rem;">
            <span style="padding-right: 1rem; font-weight: bold;">거래일자</span>
            <span>${
              purchasesResult.purchase_date ? new Date(purchasesResult.purchase_date).toLocaleDateString() : '날짜 없음'
            }</span>
        </div>          
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid black;">
        <thead>
          <tr>
            <th colspan="2" style="font-size: 20px; font-weight: bold; padding: 8px; text-align: center; background-color: #f0f0f0; border: 1px solid black;">공급자 정보</th>
            <th colspan="2" style="font-size: 20px; font-weight: bold; padding: 8px; text-align: center; background-color: #f0f0f0; border: 1px solid black;">공급받는자 정보</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">상호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; white-space: nowrap; text-align: center; border: 1px solid black;">${
              purchasesResult.supplier_name ? purchasesResult.supplier_name : ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">등록번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; white-space: nowrap; text-align: center; border: 1px solid black;">${
              companyResult.business_number
                ? companyResult.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
                : ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;" rowspan="2">주소</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;" rowspan="2">${
              purchasesResult.supplier_address || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">상호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.company_name || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">대표자명</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.representative_name || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">전화번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              purchasesResult.supplier_tel || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">전화번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.tell_number || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">팩스번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              purchasesResult.supplier_fax || ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">팩스번호</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.fax_number || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">합계금액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">₩${
              total ? total.toLocaleString() : ''
            }</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 15%; font-weight: bold; text-align: center; border: 1px solid black;">주소</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 35%; text-align: center; border: 1px solid black;">${
              companyResult.business_address || ''
            }</td>
          </tr>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 20%; font-weight: bold; text-align: center; border: 1px solid black;">적요</td>
            <td colspan="3" style="padding-top: 3px; padding-bottom: 3px; width: 80%; text-align: center; border: 1px solid black;">${
              purchasesResult.description || ''
            }</td>
          </tr>
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid black; font-size: small;">
        <thead>
          <tr>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">번호</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">품목명[규격]</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">수량[단위]</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">단가</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">공급가액</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">세액</th>
            <th style="padding-top: 3px; padding-bottom: 3px; border: 1px solid black; background-color: #f9f9f9;">적요</th>
          </tr>
        </thead>
        <tbody>
          ${purchaseItemsResult
            .map(
              (item, index) => `
              <tr>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 5%; text-align: center; border: 1px solid black;">${
                  index + 1
                }</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 17%; text-align: center; border: 1px solid black;">${
                  item.product_name
                }${item.standard ? `[${item.standard}]` : ''}</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 12%; text-align: center; border: 1px solid black;">${item.quantity.toLocaleString()}${
                item.unit ? `[${item.unit}]` : ''
              }</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 12%; text-align: right; border: 1px solid black;">₩${item.price.toLocaleString()}</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 20%; text-align: right; border: 1px solid black;">₩${(
                  item.price * item.quantity
                ).toLocaleString()}</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 15%; text-align: right; border: 1px solid black;">₩${item.sub_price.toLocaleString()}</td>
                <td style="padding-top: 2px; padding-bottom: 2px; width: 19%; text-align: center; border: 1px solid black;">${
                  item.description || ''
                }</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">합계</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">${totalQuantity.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalP.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalPrice.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;">₩${totalSub_price.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; background-color: #f9f9f9; text-align: center; border-top: 2px solid black; border: 1px solid black;"></td>
          </tr>
        </tfoot>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid black; font-size: small;">
        <tbody>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">공급가액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${totalPrice.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">세액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${totalSub_price.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">합계금액</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; white-space: nowrap; border: 1px solid black;">₩${total.toLocaleString()}</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 8%; text-align: center; font-weight: bold; background-color: #f0f0f0; border: 1px solid black;">인수자</td>
            <td style="padding-top: 3px; padding-bottom: 3px; width: 12%; text-align: center; border: 1px solid black;"></td>
          </tr>          
        </tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid black;">
        <tbody>
          <tr>
            <td style="padding-top: 3px; padding-bottom: 3px; font-weight: bold; text-align: center; width: 20%; background-color: #f0f0f0; border: 1px solid black;">계좌번호</td>
            <td colspan="7" style="padding-top: 3px; padding-bottom: 3px; text-align: right; border: 1px solid black;">${
              companyResult.account ? companyResult.account : ''
            }</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
