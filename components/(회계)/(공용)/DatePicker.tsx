'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  inputId?: string;
  maxDate?: Date;
}

export default function DatePicker(props: DatePickerProps) {
  const {
    selectedDate = new Date(), // 기본값을 오늘로 설정
    onDateChange,
    disabled = false,
    className,
    maxDate = new Date(), // maxDate 기본값을 오늘로 설정
    inputId,
  } = props;

  const [showCalendar, setShowCalendar] = useState(false);
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    selectedDate ? selectedDate.getMonth() + 1 : new Date().getMonth() + 1
  );

  const calendarRef = useRef<HTMLDivElement>(null);
  const yearSelectRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const maxYear = maxDate.getFullYear();
  const minYear = currentYear - 100;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  // 캘린더 외부 클릭 시 캘린더 닫기
  function handleDocumentClick(event: MouseEvent) {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
      setShowCalendar(false);
      setMode('day');
    }
  }

  useEffect(() => {
    if (showCalendar) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [showCalendar]);

  // 연도 선택 시 스크롤 조정
  useEffect(() => {
    if (mode === 'year' && yearSelectRef.current) {
      const selectedYearElement = yearSelectRef.current.querySelector(
        `[data-year="${selectedYear}"]`
      ) as HTMLElement | null;
      if (selectedYearElement) {
        const containerHeight = yearSelectRef.current.clientHeight;
        const elementOffsetTop = selectedYearElement.offsetTop;
        const elementHeight = selectedYearElement.clientHeight;
        yearSelectRef.current.scrollTop = elementOffsetTop - containerHeight / 2 + elementHeight / 2;
      }
    }
  }, [mode, selectedYear, years]);

  function handleInputClick() {
    if (!disabled) {
      setShowCalendar(!showCalendar);
      if (!showCalendar) {
        setMode('day');
        setSelectedYear(selectedDate.getFullYear());
        setSelectedMonth(selectedDate.getMonth() + 1);
      }
    }
  }

  function handleHeaderClick() {
    if (mode === 'day') {
      setMode('month');
    } else if (mode === 'month') {
      setMode('year');
    } else if (mode === 'year') {
      setMode('month');
    }
  }

  function handleMonthSelect(month: number) {
    // 선택한 월에 선택 가능한 날짜가 있는지 확인
    const daysInMonth = new Date(selectedYear, month, 0).getDate();
    const hasSelectableDates = Array.from({ length: daysInMonth }, (_, day) => day + 1).some((date) => {
      const currentDate = new Date(selectedYear, month - 1, date);
      return currentDate <= maxDate;
    });

    if (hasSelectableDates) {
      setSelectedMonth(month);
      setMode('day');
    }
  }

  function handleYearSelect(year: number) {
    setSelectedYear(year);
    setMode('month');
    if (year === maxDate.getFullYear() && selectedMonth !== null && selectedMonth > maxDate.getMonth() + 1) {
      setSelectedMonth(maxDate.getMonth() + 1);
    }
  }

  function handleDateSelect(date: number) {
    if (selectedMonth === null) return;
    const newDate = new Date(selectedYear, selectedMonth - 1, date);
    onDateChange(newDate);
    setShowCalendar(false);
    setMode('day');
  }

  function handlePrev() {
    if (mode === 'day') {
      handlePrevMonth();
    } else if (mode === 'month') {
      handlePrevYear();
    }
  }

  function handleNext() {
    if (mode === 'day') {
      handleNextMonth();
    } else if (mode === 'month') {
      handleNextYear();
    }
  }

  function handlePrevMonth() {
    if (selectedMonth === null) return;
    if (selectedMonth === 1) {
      const newYear = selectedYear - 1;
      if (newYear >= minYear) {
        setSelectedYear(newYear);
        setSelectedMonth(12);
      }
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === null) return;
    if (selectedMonth === 12) {
      const newYear = selectedYear + 1;
      if (newYear <= maxYear) {
        setSelectedYear(newYear);
        setSelectedMonth(1);
      }
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  function handlePrevYear() {
    const newYear = selectedYear - 1;
    if (newYear >= minYear) {
      setSelectedYear(newYear);
    }
  }

  function handleNextYear() {
    const newYear = selectedYear + 1;
    if (newYear <= maxYear) {
      setSelectedYear(newYear);
    }
  }

  function renderMonthSelection() {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return (
      <div className={styles.monthSelectContainer}>
        {months.map((month, index) => {
          const monthNumber = index + 1;
          const daysInMonth = new Date(selectedYear, monthNumber, 0).getDate();
          const hasSelectableDates = Array.from({ length: daysInMonth }, (_, day) => day + 1).some((date) => {
            const currentDate = new Date(selectedYear, index, date);
            return currentDate <= maxDate;
          });

          return (
            <div
              key={monthNumber}
              onClick={hasSelectableDates ? () => handleMonthSelect(monthNumber) : undefined}
              className={`${styles.monthOption} ${selectedMonth === monthNumber ? styles.selectedMonthOption : ''} ${
                !hasSelectableDates ? styles.disabled : ''
              }`}
            >
              {month}
            </div>
          );
        })}
      </div>
    );
  }

  function renderYearSelection() {
    return (
      <div className={styles.yearSelect} ref={yearSelectRef}>
        {years.map((year) => (
          <div
            key={year}
            data-year={year}
            onClick={() => handleYearSelect(year)}
            className={`${styles.yearOption} ${year === selectedYear ? styles.selectedYearOption : ''}`}
          >
            {year}년
          </div>
        ))}
      </div>
    );
  }

  function renderDaySelection() {
    if (selectedMonth === null) return null;
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    const dates = [];

    // 빈 셀 추가
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(<div key={`empty-${i}`} className={styles.empty}></div>);
    }

    // 일자 셀 추가
    for (let date = 1; date <= daysInMonth; date++) {
      const currentDate = new Date(selectedYear, selectedMonth - 1, date);
      currentDate.setHours(0, 0, 0, 0);

      const isFuture = currentDate > maxDate;

      const isSelected =
        selectedDate &&
        currentDate.getFullYear() === selectedDate.getFullYear() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getDate() === selectedDate.getDate();

      dates.push(
        <div
          key={date}
          className={`${styles.date} ${isFuture ? styles.disabled : ''} ${isSelected ? styles.selected : ''}`}
          onClick={!isFuture ? () => handleDateSelect(date) : undefined}
        >
          {date}
        </div>
      );
    }

    return <div className={styles.dateGrid}>{dates}</div>;
  }

  const isPrevDisabled = (() => {
    if (mode === 'day' && selectedMonth !== null) {
      if (selectedYear < minYear) return true;
      if (selectedYear === minYear && selectedMonth === 1) return true;
    }
    return false;
  })();

  const isNextDisabled = (() => {
    if (mode === 'day' && selectedMonth !== null) {
      if (selectedYear > maxYear) return true;
      if (selectedYear === maxYear && selectedMonth >= maxDate.getMonth() + 1) return true;
    }
    return false;
  })();

  function renderHeaderLabel() {
    if (mode === 'day') {
      return (
        <div onClick={handleHeaderClick} className={styles.headerLabel}>
          {selectedYear}년 {selectedMonth}월
        </div>
      );
    } else if (mode === 'month') {
      return (
        <div onClick={handleHeaderClick} className={styles.headerLabel}>
          {selectedYear}년
        </div>
      );
    } else if (mode === 'year') {
      return (
        <div onClick={handleHeaderClick} className={`${styles.headerLabel} ${styles.center}`}>
          {selectedYear}년
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`${styles.datePicker} ${className || ''}`}>
      <input
        type="text"
        id={inputId}
        value={
          selectedDate
            ? `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
            : ''
        }
        readOnly
        onClick={handleInputClick}
        className={`${styles.selectedDate} ${styles.hover}`}
        disabled={disabled}
      />
      {showCalendar && (
        <div className={styles.calendar} ref={calendarRef}>
          <div className={styles.calendarHeader}>
            {(mode === 'day' || mode === 'month') && (
              <button type="button" onClick={handlePrev} disabled={mode === 'day' ? isPrevDisabled : false}>
                &lt;
              </button>
            )}
            {renderHeaderLabel()}
            {(mode === 'day' || mode === 'month') && (
              <button type="button" onClick={handleNext} disabled={mode === 'day' ? isNextDisabled : false}>
                &gt;
              </button>
            )}
          </div>
          {mode === 'month' && renderMonthSelection()}
          {mode === 'year' && renderYearSelection()}
          {mode === 'day' && renderDaySelection()}
        </div>
      )}
    </div>
  );
}
