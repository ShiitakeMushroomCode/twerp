// ProductSearchClick.tsx
import { numberToKorean } from '@/util/reform';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './ProductSearchButton.module.css';

const MySwal = withReactContent(Swal);

export default async function ProductSearchClick({ handleSelectProduct = null }) {
  const { value: selectedProduct } = await MySwal.fire({
    title: '제품 검색',
    html: `
      <div class="${styles.productModalContent}">
        <div class="${styles.searchFields}">
          <input type="text" id="productSearchInput" placeholder="검색어 입력" autocomplete="off" class="${styles.searchInput}" />
          <button id="productSearchButton" class="${styles.searchButton}">
            <span class="${styles.searchIcon}">검색</span>
          </button>
        </div>
        <div class="${styles.tableContainer}">
          <table class="${styles.table}">
            <thead>
              <tr>
                <th>제품명</th>
                <th>카테고리</th>
                <th>제조업체</th>
                <th>가격</th>
              </tr>
            </thead>
            <tbody id="productTableBody">
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
      popup: `${styles.productCustomSwal}`,
    },
    didOpen: () => {
      const searchInput = Swal.getHtmlContainer()?.querySelector('#productSearchInput') as HTMLInputElement;
      const searchButton = Swal.getHtmlContainer()?.querySelector('#productSearchButton') as HTMLButtonElement;
      const tableBody = Swal.getHtmlContainer()?.querySelector('#productTableBody') as HTMLElement;
      const paginationContainer = Swal.getHtmlContainer()?.querySelector('#paginationContainer') as HTMLElement;

      let currentPage = 1;
      const itemsPerPage = 5;
      let totalPages = 1;
      let totalCount = 0;
      let searchTerm = '';

      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/getProductList?offset=${
              (currentPage - 1) * itemsPerPage
            }&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('데이터를 가져오는데 실패했습니다');
          }

          const data = await response.json();

          totalCount = data.totalCount;
          totalPages = Math.ceil(totalCount / itemsPerPage);

          // 테이블 데이터 렌더링
          tableBody.innerHTML = data.fData
            .map(
              (product) => `
                <tr 
                  data-id="${product.product_id}" 
                  data-name="${product.product_name}" 
                  data-category="${product.category}" 
                  data-price="${product.price}" 
                  data-standard="${product.standard === null ? '' : product.standard}"
                  data-unit="${product.unit === null ? '' : product.unit}"
                  data-description="${product.description}"
                  data-manufacturer="${product.manufacturer}"
                  title="${product.product_name}">
                  <td title="${product.product_name}">${product.product_name}</td>
                  <td title="${product.category}">${product.category}</td>
                  <td title="${product.manufacturer}">${product.manufacturer}</td>
                  <td title="\\${product.price.toLocaleString()}\n${numberToKorean(
                product.price
              )}원정" style="text-align: right;">\\${product.price.toLocaleString()}</td>
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
                product_id: row.getAttribute('data-id'),
                product_name: row.getAttribute('data-name'),
                category: row.getAttribute('data-category'),
                price: row.getAttribute('data-price'),
                standard: row.getAttribute('data-standard'),
                unit: row.getAttribute('data-unit'),
                manufacturer: row.getAttribute('data-manufacturer'),
              };
              MySwal.close();
              // 선택된 제품을 처리하는 함수 호출
              handleSelectProduct(selected);
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
            <button class="${styles.paginationButton} ${
            i === currentPage ? styles.activePage : ''
          }" data-page="${i}">${i}</button>
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

  if (selectedProduct) {
    // console.log('Selected Product:', selectedProduct);
  }
}
