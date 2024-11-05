import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './ClientSearchButton.module.css';

interface Company {
  id: number;
  businessNumber: string;
  companyName: string;
}

const MySwal = withReactContent(Swal);

const mockData: Company[] = [
  { id: 1, businessNumber: '123-45-67890', companyName: 'ABC Corp' },
  { id: 2, businessNumber: '234-56-78901', companyName: 'XYZ Ltd' },
  { id: 3, businessNumber: '345-67-89012', companyName: 'Acme Inc' },
  { id: 4, businessNumber: '456-78-90123', companyName: 'Globex Corporation' },
  { id: 5, businessNumber: '567-89-01234', companyName: 'Soylent Corp' },
];

export default async function handleClientSearchClick({ handleInitForm }) {
  // SweetAlert2 모달을 띄워 검색 기능 및 테이블을 구현
  const { value: selectedCompany } = await MySwal.fire({
    title: '검색',
    html: `
      <div class="${styles.modalContent}">
        <div class="${styles.searchFields}">
          <input type="text" id="searchInput" placeholder="검색어 입력" class="${styles.searchInput}" />
          <button id="searchButton" class="${styles.searchButton}">
            <span class="${styles.searchIcon}">검색</span>
          </button>
        </div>
        <div class="${styles.tableContainer}">
          <table class="${styles.table}">
            <thead>
              <tr>
                <th>사업자번호</th>
                <th>기업명</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              ${mockData
                .map(
                  (company) => `
                <tr data-id="${company.id}" data-business="${company.businessNumber}" data-name="${company.companyName}" title="${company.companyName}">
                  <td title="${company.businessNumber}">${company.businessNumber}</td>
                  <td title="${company.companyName}">${company.companyName}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `,
    showConfirmButton: false,
    customClass: {
      popup: `${styles.customSwal}`,
    },
    didOpen: () => {
      const searchInput = Swal.getHtmlContainer()?.querySelector('#searchInput') as HTMLInputElement;
      const tableBody = Swal.getHtmlContainer()?.querySelector('#tableBody');

      const filterTable = () => {
        const searchValue = searchInput.value.toLowerCase();
        const rows = tableBody?.querySelectorAll('tr');
        rows?.forEach((row) => {
          const business = row.getAttribute('data-business')?.toLowerCase() || '';
          const name = row.getAttribute('data-name')?.toLowerCase() || '';
          if (business.includes(searchValue) || name.includes(searchValue)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      };

      searchInput.addEventListener('input', filterTable);

      const rows = tableBody?.querySelectorAll('tr');
      rows?.forEach((row) => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          const selected = {
            id: row.getAttribute('data-id'),
            businessNumber: row.getAttribute('data-business'),
            companyName: row.getAttribute('data-name'),
          };
          MySwal.close();
          handleInitForm({ name: 'client_name', value: selected.companyName });
          console.log('Selected Company:', selected);
        });
      });
    },
  });
}
