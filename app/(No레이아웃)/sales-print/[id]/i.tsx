'use client';

export default function Invoice({ fetchSalesData }) {
  const { companyResult, salesResult, salesItemsResult } = fetchSalesData;

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
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        width: '100%',
        maxWidth: '1078px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        fontSize: 'small',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid black',
          paddingBottom: '5px',
          marginBottom: '16px',
        }}
      >
        <h1
          style={{
            marginLeft: '1rem',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          거래명세서
        </h1>
        <div style={{ width: '50%', textAlign: 'right', fontSize: '1rem' }}>
          <span style={{ paddingRight: '1rem', fontWeight: 'bold' }}>
            거래일자
          </span>
          <span>
            {salesResult.sale_date
              ? new Date(salesResult.sale_date).toLocaleDateString()
              : '날짜 없음'}
          </span>
        </div>
      </div>

      {/* Supplier and Client Information Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
          border: '1px solid black',
        }}
      >
        <thead>
          <tr>
            <th
              colSpan={2}
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
                
              }}
            >
              공급받는자 정보
            </th>
            <th
              colSpan={2}
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
              }}
            >
              공급자 정보
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              상호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {salesResult.client_name ? salesResult.client_name : ''}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              등록번호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.business_number
                ? companyResult.business_number.replace(
                    /(\d{3})(\d{2})(\d{5})/,
                    '$1-$2-$3'
                  )
                : ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
              rowSpan={2}
            >
              주소
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
              rowSpan={2}
            >
              {salesResult.client_address || ''}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              상호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.company_name || ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              대표자명
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.representative_name || ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              전화번호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {salesResult.client_tel || ''}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              전화번호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.tell_number || ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              팩스번호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {salesResult.client_fax || ''}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              팩스번호
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.fax_number || ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              합계금액
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              ₩{total ? total.toLocaleString() : ''}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '15%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              주소
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '35%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {companyResult.business_address || ''}
            </td>
          </tr>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '20%',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              적요
            </td>
            <td
              colSpan={3}
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '80%',
                textAlign: 'center',
                border: '1px solid black',
              }}
            >
              {salesResult.description || ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Sales Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
          border: '1px solid black',
          fontSize: 'small',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              번호
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              품목명[규격]
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              수량[단위]
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              단가
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              공급가액
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              세액
            </th>
            <th
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                border: '1px solid black',
                backgroundColor: '#f9f9f9',
              }}
            >
              적요
            </th>
          </tr>
        </thead>
        <tbody>
          {salesItemsResult.map((item, index) => (
            <tr key={index}>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '5%',
                  textAlign: 'center',
                  border: '1px solid black',
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '15%',
                  textAlign: 'center',
                  border: '1px solid black',
                }}
              >
                {item.product_name}
                {item.standard ? `[${item.standard}]` : ''}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '10%',
                  textAlign: 'center',
                  border: '1px solid black',
                }}
              >
                {item.quantity.toLocaleString()}
                {item.unit ? `[${item.unit}]` : ''}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '10%',
                  textAlign: 'right',
                  border: '1px solid black',
                }}
              >
                ₩{item.price.toLocaleString()}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '20%',
                  textAlign: 'right',
                  border: '1px solid black',
                }}
              >
                ₩{(item.price * item.quantity).toLocaleString()}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '15%',
                  textAlign: 'right',
                  border: '1px solid black',
                }}
              >
                ₩{item.sub_price.toLocaleString()}
              </td>
              <td
                style={{
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  width: '25%',
                  textAlign: 'center',
                  border: '1px solid black',
                }}
              >
                {item.description || ''}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={2}
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            >
              합계
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            >
              {totalQuantity.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            >
              ₩{totalP.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            >
              ₩{totalPrice.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            >
              ₩{totalSub_price.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                borderTop: '2px solid black',
                border: '1px solid black',
              }}
            ></td>
          </tr>
        </tfoot>
      </table>

      {/* Summary Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '5px',
          border: '1px solid black',
          fontSize: 'small',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '8%',
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
                whiteSpace: 'nowrap',
              }}
            >
              공급가액
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '12%',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                border: '1px solid black',
              }}
            >
              ₩{totalPrice.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '8%',
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
                whiteSpace: 'nowrap',
              }}
            >
              세액
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '12%',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                border: '1px solid black',
              }}
            >
              ₩{totalSub_price.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '8%',
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
                whiteSpace: 'nowrap',
              }}
            >
              합계금액
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '12%',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                border: '1px solid black',
              }}
            >
              ₩{total.toLocaleString()}
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '8%',
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
                whiteSpace: 'nowrap',
              }}
            >
              인수자
            </td>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                width: '12%',
                textAlign: 'center',
                border: '1px solid black',
                whiteSpace: 'nowrap',
              }}
            ></td>
          </tr>
        </tbody>
      </table>

      {/* Account Information Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '5px',
          border: '1px solid black',
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '20%',
                backgroundColor: '#f0f0f0',
                border: '1px solid black',
              }}
            >
              계좌번호
            </td>
            <td
              colSpan={7}
              style={{
                paddingTop: '3px',
                paddingBottom: '3px',
                textAlign: 'right',
                border: '1px solid black',
              }}
            >
              {companyResult.account ? companyResult.account : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
