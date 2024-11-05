import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './ProductSearchButton.module.css';

interface Product {
  id: number;
  productName: string;
  category: string;
  price: string;
}

const MySwal = withReactContent(Swal);

const productData: Product[] = [
  { id: 1, productName: 'Laptop X200', category: 'Electronics', price: '$999' },
  { id: 2, productName: 'Smartphone Y300', category: 'Mobile', price: '$699' },
  { id: 3, productName: 'Wireless Headphones', category: 'Accessories', price: '$199' },
  { id: 4, productName: '4K TV Ultra', category: 'Home Appliance', price: '$1499' },
  { id: 5, productName: 'Gaming Console Z', category: 'Gaming', price: '$399' },
];

export default async function ProductSearchClick({}) {
  const { value: selectedProduct } = await MySwal.fire({
    title: '제품 검색',
    html: `
      <div class="${styles.productModalContent}">
        <div class="${styles.searchFields}">
          <input type="text" id="productSearchInput" placeholder="검색어 입력" class="${styles.searchInput}" />
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
                <th>가격</th>
              </tr>
            </thead>
            <tbody id="productTableBody">
              ${productData
                .map(
                  (product) => `
                <tr data-id="${product.id}" data-name="${product.productName}" data-category="${product.category}" data-price="${product.price}" title="${product.productName}">
                  <td title="${product.productName}">${product.productName}</td>
                  <td title="${product.category}">${product.category}</td>
                  <td title="${product.price}">${product.price}</td>
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
      popup: `${styles.productCustomSwal}`,
    },
    didOpen: () => {
      const searchInput = Swal.getHtmlContainer()?.querySelector('#productSearchInput') as HTMLInputElement;
      const tableBody = Swal.getHtmlContainer()?.querySelector('#productTableBody');

      const filterTable = () => {
        const searchValue = searchInput.value.toLowerCase();
        const rows = tableBody?.querySelectorAll('tr');
        rows?.forEach((row) => {
          const name = row.getAttribute('data-name')?.toLowerCase() || '';
          const category = row.getAttribute('data-category')?.toLowerCase() || '';
          if (name.includes(searchValue) || category.includes(searchValue)) {
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
            productName: row.getAttribute('data-name'),
            category: row.getAttribute('data-category'),
            price: row.getAttribute('data-price'),
          };
          MySwal.close();
          console.log('Selected Product:', selected);
        });
      });
    },
  });

  if (selectedProduct) {
    console.log('Selected Product:', selectedProduct);
  }
}
