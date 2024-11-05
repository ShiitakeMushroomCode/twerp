import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './ClientSearchClick.module.css';

const MySwal = withReactContent(Swal);

export default async function handleClientSearchClick({ handleInitForm }) {  
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
              <!-- 데이터가 여기에 로드됩니다 -->
            </tbody>
          </table>
        </div>
        <div class="${styles.pagination}" id="paginationContainer">
          <!-- 페이지네이션 버튼이 여기에 로드됩니다 -->
        </div>
      </div>
    `,
    showConfirmButton: false,
    customClass: {
      popup: `${styles.customSwal}`,
    },
    didOpen: () => {
      const searchInput = Swal.getHtmlContainer()?.querySelector('#searchInput') as HTMLInputElement;
      const searchButton = Swal.getHtmlContainer()?.querySelector('#searchButton') as HTMLButtonElement;
      const tableBody = Swal.getHtmlContainer()?.querySelector('#tableBody') as HTMLElement;
      const paginationContainer = Swal.getHtmlContainer()?.querySelector('#paginationContainer') as HTMLElement;

      let currentPage = 1;
      const itemsPerPage = 5;
      let totalPages = 1;
      let totalCount = 0;
      let searchTerm = '';

      const fetchData = async () => {
        try {
          const response = await fetch(`/api/getClientList?offset=${(currentPage - 1) * itemsPerPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('데이터를 가져오는데 실패했습니다');
          }

          const data = await response.json();

          totalCount = data.totalCount;
          totalPages = Math.ceil(totalCount / itemsPerPage);

          // 테이블 데이터 렌더링
          tableBody.innerHTML = data.fData
            .map(
              (company) => `
                <tr data-id="${company.clients_id}" data-business="${company.business_number}" data-name="${company.company_name}" title="${company.company_name}">
                  <td title="${company.business_number}">${company.business_number.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}</td>
                  <td title="${company.company_name}">${company.company_name}</td>
                </tr>
              `
            )
            .join('');

          // 행에 클릭 이벤트 추가
          const rows = tableBody.querySelectorAll('tr');
          rows.forEach((row) => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
              const selected = {
                id: row.getAttribute('data-id'),
                businessNumber: row.getAttribute('data-business'),
                companyName: row.getAttribute('data-name'),
              };
              MySwal.close();
              handleInitForm({ name: 'client_name', value: selected.companyName });
              console.log('선택된 회사:', selected);
            });
          });

          // 페이지네이션 컨트롤 렌더링
          renderPaginationControls();
        } catch (error) {
          console.error('데이터를 가져오는데 실패했습니다:', error);
        }
      };

      const renderPaginationControls = () => {
        let paginationHtml = '';

        // 처음 및 이전 5페이지 버튼
        paginationHtml += `
          <button class="${styles.paginationButton}" data-page="first">&laquo;</button>
          <button class="${styles.paginationButton}" data-page="prev5">&lsaquo;</button>
        `;

        // 최대 5개의 페이지 버튼
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // 시작 페이지 조정
        if (endPage - startPage < maxPageButtons - 1) {
          startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          paginationHtml += `
            <button class="${styles.paginationButton} ${i === currentPage ? styles.activePage : ''}" data-page="${i}">${i}</button>
          `;
        }

        // 다음 5페이지 및 마지막 페이지 버튼
        paginationHtml += `
          <button class="${styles.paginationButton}" data-page="next5">&rsaquo;</button>
          <button class="${styles.paginationButton}" data-page="last">&raquo;</button>
        `;

        paginationContainer.innerHTML = paginationHtml;

        // 페이지네이션 버튼에 이벤트 리스너 추가
        const paginationButtons = paginationContainer.querySelectorAll(`.${styles.paginationButton}`);
        paginationButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const pageAttr = button.getAttribute('data-page');
            if (pageAttr === 'first') {
              currentPage = 1;
            } else if (pageAttr === 'prev5') {
              currentPage = Math.max(1, currentPage - 5);
            } else if (pageAttr === 'next5') {
              currentPage = Math.min(totalPages, currentPage + 5);
            } else if (pageAttr === 'last') {
              currentPage = totalPages;
            } else {
              currentPage = parseInt(pageAttr);
            }
            fetchData();
          });
        });
      };

      // 초기 데이터 가져오기
      fetchData();

      // 검색 기능
      const onSearch = () => {
        searchTerm = searchInput.value;
        currentPage = 1;
        fetchData();
      };

      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          onSearch();
        }
      });

      searchButton.addEventListener('click', onSearch);
    },
  });
}
