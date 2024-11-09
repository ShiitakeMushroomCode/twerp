'use server';

import { SalesPrintFormData } from '@/components/(회계)/(판매)/(Print)/SalesPrintForm';
import { executeQuery } from '@/lib/db';
import { getTokenUserData } from '@/util/token';
import { ACT } from 'auth';
import { cookies as nextCookies } from 'next/headers';

export async function fetchSalesData(id: string): Promise<SalesPrintFormData> {
  const data = (await getTokenUserData()) as ACT;
  const companyIdBuffer = Buffer.from(data.companyId['data'], 'hex');
  const salesIdBuffer = Buffer.from(id, 'hex');

  const [companyResult, salesResult, salesItemsResult] = await Promise.all([
    executeQuery('SELECT * FROM company WHERE company_id = ?', [companyIdBuffer]),
    executeQuery('SELECT * FROM sales WHERE sales_id = ?', [salesIdBuffer]),
    executeQuery('SELECT * FROM sales_items WHERE sales_id = ?', [salesIdBuffer]),
  ]);
  return {
    companyResult: companyResult[0],
    salesResult: salesResult[0],
    salesItemsResult,
  };
}

export async function generateSalesPrintHtml(id: string): Promise<string> {
  const puppeteer = (await import('puppeteer')).default;
  // Puppeteer 브라우저 실행
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCookie(
    { ...nextCookies().get('accessToken'), domain: process.env.DOMAIN_URL, secure: true, httpOnly: true },
    { ...nextCookies().get('refreshToken'), domain: process.env.DOMAIN_URL, secure: true, httpOnly: true }
  );

  // 페이지 URL로 이동
  const url = `${process.env.SITE_URL}/sales-print-email/${id}`;
  await page.goto(url, { waitUntil: 'networkidle0' });

  // const puppeteerCookies = await page.cookies();
  // console.log('Puppeteer에 설정된 쿠키:', puppeteerCookies);

  // 페이지의 HTML 콘텐츠 추출
  const html = await page.content();

  // 브라우저 종료
  await browser.close();

  return html;
}
