export interface ACT {
  companyId: Buffer;
  userId: string; // 휴대전화 번호
  department?: string; // 부서명
  name?: string; // 이름
  tellNumber?: string; // 전화번호
  position?: string; // 직급
  email?: string; // 이메일
  hireDate?: string; // 입사일
  status?: string; // 현상태
}
export interface Client {
  clients_id: Buffer; // 자동 생성된 id
  company_id: Buffer; // 연결된 회사의 id
  business_number: string; // 사업자 번호
  company_name: string; // 회사명(상호)
  representative_name: string; // 대표자명
  business_address?: string; // 소재지 (선택 항목)
  billing_email?: string; // 세금계산서 메일 (선택 항목)
  tell_number?: string; // 대표 전화 (선택 항목)
  fax_number?: string; // 대표 팩스 (선택 항목)
  start_date: Date; // 시작일
  business_status?: string; // 업태 (선택 항목)
  main_item_name?: string; // 주종목명 (선택 항목)
  description?: string; // 주석 (선택 항목)
}
