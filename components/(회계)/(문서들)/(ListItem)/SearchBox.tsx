'use client';

import { formatPrice } from '@/util/reform';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from './SearchBox.module.css';

const MySwal = withReactContent(Swal);

interface SearchOptions {
  clientName?: string;
  startDate?: string;
  itemName?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface SearchBoxProps {
  type: string;
  onSearch: (term: string, options?: SearchOptions) => void;
  searchOptions: SearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  onResetOptions: () => void;
}

export default function SearchBox({ type, onSearch, searchOptions, setSearchOptions, onResetOptions }: SearchBoxProps) {
  const [input, setInput] = useState<string>('');
  const router = useRouter();

  function handleAdd(isNewTab: boolean) {
    if (isNewTab) {
      const width = 600;
      const height = 400;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popupWindow = window.open(
        `/${type}-add`,
        `editPopup-${Date.now()}`,
        `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
      );

      if (popupWindow) {
        popupWindow.focus();
      }
    } else {
      router.push(`/${type}-add`);
    }
  }

  const handleSearch = () => {
    onSearch(input.trim(), searchOptions);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOptions = () => {
    MySwal.fire({
      title: '검색 옵션',
      html: `
      <div class="${styles.popupContainer}">
        <div class="${styles.popupRow}">
          <label for="swal-input-client-name">거래처명 :</label>
          <input type="text" id="swal-input-client-name" autoComplete="off" class="${styles.swal2Input}" value="${
        searchOptions.clientName || ''
      }" />
        </div>
        <div class="${styles.popupRow}">
          <label for="swal-input-item-name">품목명 :</label>
          <input type="text" id="swal-input-item-name" autoComplete="off" class="${styles.swal2Input}" value="${
        searchOptions.itemName || ''
      }" />
        </div>
        <div class="${styles.popupRow}">
          <label for="swal-input-start-date">거래일자 :</label>
          <div class="${styles.popupRow}">
            <input type="date" id="swal-input-start-date" class="${styles.dateInput}" value="${
        searchOptions.startDate || ''
      }" />  ~ 
            <input type="date" id="swal-input-end-date" class="${styles.dateInput}" value="${
        searchOptions.endDate || ''
      }" />
            <button type="button" id="date-reset-button" class="${styles.dateResetButton}">날짜 초기화</button>
          </div>
        </div>
        <div class="${styles.popupRow}">
          <label for="swal-input-min-amount">금액 :</label>
          <div class="${styles.amountContainer}">
            <input type="text" id="swal-input-min-amount" autoComplete="off" class="${
              styles.swal2Input
            }" placeholder="최소 금액" value="${
        searchOptions.minAmount !== undefined ? formatPrice(searchOptions.minAmount) : ''
      }" /> 원
            ~ 
            <input type="text" id="swal-input-max-amount" autoComplete="off" class="${
              styles.swal2Input
            }" placeholder="최대 금액" value="${
        searchOptions.maxAmount !== undefined ? formatPrice(searchOptions.maxAmount) : ''
      }" /> 원
          </div>
        </div>
        <div class="${styles.presetContainer}">
          <span>옵션 :</span>
          <button type="button" class="${styles.presetButton}" data-preset="today">오늘</button>
          <button type="button" class="${styles.presetButton}" data-preset="last7">지난 7일</button>
          <button type="button" class="${styles.presetButton}" data-preset="last30">지난 30일</button>
          <button type="button" class="${styles.presetButton}" data-preset="nowYear">올해</button>
          <button type="button" class="${styles.resetButton}">초기화</button>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: '검색',
      cancelButtonText: '취소',
      width: '630px',
      didOpen: () => {
        // ARIA 속성 추가
        const modal = Swal.getPopup();
        if (modal) {
          modal.setAttribute('role', 'dialog');
          modal.setAttribute('aria-modal', 'true');
          modal.setAttribute('aria-labelledby', 'swal2-title');
        }

        // 프리셋 버튼 이벤트 핸들러 추가
        const presetButtons = document.querySelectorAll(`.${styles.presetButton}`);
        presetButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const preset = button.getAttribute('data-preset');
            if (preset) {
              let start: string = '';
              let end: string = '';
              const today = new Date();

              switch (preset) {
                case 'today':
                  start = format(today, 'yyyy-MM-dd');
                  end = format(today, 'yyyy-MM-dd');
                  break;
                case 'last7':
                  const last7 = subDays(today, 6);
                  start = format(last7, 'yyyy-MM-dd');
                  end = format(today, 'yyyy-MM-dd');
                  break;
                case 'last30':
                  const last30 = subDays(today, 29);
                  start = format(last30, 'yyyy-MM-dd');
                  end = format(today, 'yyyy-MM-dd');
                  break;
                case 'nowYear':
                  const currentYear = new Date().getFullYear();
                  start = format(new Date(`${currentYear}-01-01`), 'yyyy-MM-dd');
                  end = format(new Date(`${currentYear}-12-31`), 'yyyy-MM-dd');
                  break;
                default:
                  break;
              }

              if (start && end) {
                const startDateInput = document.getElementById('swal-input-start-date') as HTMLInputElement;
                const endDateInput = document.getElementById('swal-input-end-date') as HTMLInputElement;
                if (startDateInput && endDateInput) {
                  startDateInput.value = start;
                  endDateInput.value = end;
                }
              }
            }
          });
        });

        // 초기화 버튼 이벤트 핸들러 추가
        const resetButton = document.querySelector(`.${styles.resetButton}`) as HTMLButtonElement;
        if (resetButton) {
          resetButton.addEventListener('click', () => {
            // 모달 입력 필드 초기화
            const clientNameInput = document.getElementById('swal-input-client-name') as HTMLInputElement;
            const itemNameInput = document.getElementById('swal-input-item-name') as HTMLInputElement;
            const startDateInput = document.getElementById('swal-input-start-date') as HTMLInputElement;
            const endDateInput = document.getElementById('swal-input-end-date') as HTMLInputElement;
            const minAmountInput = document.getElementById('swal-input-min-amount') as HTMLInputElement;
            const maxAmountInput = document.getElementById('swal-input-max-amount') as HTMLInputElement;

            if (clientNameInput) clientNameInput.value = '';
            if (itemNameInput) itemNameInput.value = '';
            if (startDateInput) startDateInput.value = '';
            if (endDateInput) endDateInput.value = '';
            if (minAmountInput) minAmountInput.value = '';
            if (maxAmountInput) maxAmountInput.value = '';

            // 상위 컴포넌트의 옵션 초기화 함수 호출
            onResetOptions();
          });
        }

        // 날짜 초기화 버튼 이벤트 핸들러 추가
        const dateResetButton = document.getElementById('date-reset-button') as HTMLButtonElement;

        if (dateResetButton) {
          dateResetButton.addEventListener('click', () => {
            const startDateInput = document.getElementById('swal-input-start-date') as HTMLInputElement;
            const endDateInput = document.getElementById('swal-input-end-date') as HTMLInputElement;
            if (startDateInput) {
              startDateInput.value = '';
            }
            if (endDateInput) {
              endDateInput.value = '';
            }
          });
        }

        // 포커스 관리: 모달이 열릴 때 첫 번째 입력 필드로 포커스 이동
        const firstInput = document.getElementById('swal-input-client-name') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }

        // 금액 입력 필드 포맷팅
        const minAmountInput = document.getElementById('swal-input-min-amount') as HTMLInputElement;
        const maxAmountInput = document.getElementById('swal-input-max-amount') as HTMLInputElement;

        const formatInput = (inputElement: HTMLInputElement) => {
          inputElement.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const value = target.value.replace(/,/g, '').replace(/[^0-9]/g, '');

            if (value) {
              const formatted = formatPrice(Number(value));
              target.value = formatted.toString();
            } else {
              target.value = '';
            }
          });

          inputElement.addEventListener('keypress', (e) => {
            const key = e.key;
            if (!/^\d$/.test(key)) {
              e.preventDefault();
            }
          });
        };

        if (minAmountInput) {
          formatInput(minAmountInput);
        }

        if (maxAmountInput) {
          formatInput(maxAmountInput);
        }
      },
      preConfirm: () => {
        const clientName = (document.getElementById('swal-input-client-name') as HTMLInputElement).value;
        const itemName = (document.getElementById('swal-input-item-name') as HTMLInputElement).value;
        const startDate = (document.getElementById('swal-input-start-date') as HTMLInputElement).value;
        const endDate = (document.getElementById('swal-input-end-date') as HTMLInputElement).value;
        const minAmountRaw = (document.getElementById('swal-input-min-amount') as HTMLInputElement).value;
        const maxAmountRaw = (document.getElementById('swal-input-max-amount') as HTMLInputElement).value;

        // 쉼표 제거 후 숫자로 변환
        const minAmount = minAmountRaw ? Number(minAmountRaw.replace(/,/g, '')) : undefined;
        const maxAmount = maxAmountRaw ? Number(maxAmountRaw.replace(/,/g, '')) : undefined;

        return {
          clientName: clientName.trim() || undefined,
          itemName: itemName.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          minAmount: minAmount !== undefined && !isNaN(minAmount) ? minAmount : undefined,
          maxAmount: maxAmount !== undefined && !isNaN(maxAmount) ? maxAmount : undefined,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
          // 상위 컴포넌트의 searchOptions 상태 업데이트
          setSearchOptions(result.value);
          // 검색 실행 (옵션 검색)
          onSearch('', result.value);
          // 메인 입력 필드 초기화
          setInput('');
        } else {
          // 검색 옵션이 없을 경우 초기화된 상태로 검색 실행
          setSearchOptions({});
          onSearch('', {});
          // 메인 입력 필드 초기화
          setInput('');
        }
      }
      // '취소' 버튼을 클릭했을 때는 아무 동작도 하지 않음
    });
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder="검색어를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="검색어 입력"
        id="search"
        name="search"
      />
      <button onClick={handleSearch} className={styles.button}>
        검색
      </button>
      <button
        onClick={handleOptions}
        className={styles.button}
        aria-haspopup="dialog"
        aria-controls="search-options-modal"
      >
        옵션
      </button>
      <button
        onClick={(event) => {
          handleAdd(event.ctrlKey || event.metaKey);
        }}
        className={styles.button}
      >
        추가
      </button>
    </div>
  );
}
