'use client';
import styles from './DatePicker.module.css';

import { useEffect, useRef, useState } from 'react';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  inputId?: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
export default function DatePicker(props: DatePickerProps) {
  const { selectedDate, onDateChange, disabled = false, className } = props;
  const [showCalendar, setShowCalendar] = useState(false);
  const [displayYear, setDisplayYear] = useState(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(
    selectedDate ? selectedDate.getMonth() + 1 : new Date().getMonth() + 1
  );
  const [yearSelectMode, setYearSelectMode] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  function handleDocumentClick(event: MouseEvent) {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
      setShowCalendar(false);
      setYearSelectMode(false);
    }
  }

  useEffect(
    function () {
      if (showCalendar) {
        document.addEventListener('mousedown', handleDocumentClick);
      } else {
        document.removeEventListener('mousedown', handleDocumentClick);
      }
      return function cleanup() {
        document.removeEventListener('mousedown', handleDocumentClick);
      };
    },
    [showCalendar]
  );

  function handleInputClick() {
    if (!disabled) {
      setShowCalendar(!showCalendar);
    }
  }

  function handlePrevMonth() {
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  }

  function handleNextMonth() {
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  }

  function handleDateSelect(date: number) {
    const newDate = new Date(displayYear, displayMonth - 1, date);
    onDateChange(newDate);
    setShowCalendar(false);
    setYearSelectMode(false);
  }

  function handleHeaderClick() {
    setYearSelectMode(true);
  }

  function handleYearSelect(year: number) {
    setDisplayYear(year);
    setYearSelectMode(false);
  }

  function renderCalendar() {
    const firstDayOfMonth = new Date(displayYear, displayMonth - 1, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(<div key={`empty-${i}`} className={styles.empty}></div>);
    }

    for (let date = 1; date <= daysInMonth; date++) {
      const currentDate = new Date(displayYear, displayMonth - 1, date);
      currentDate.setHours(0, 0, 0, 0);

      const isFuture = currentDate > today;

      dates.push(
        <div
          key={date}
          className={`${styles.date} ${isFuture ? styles.disabled : ''}`}
          onClick={!isFuture ? () => handleDateSelect(date) : undefined}
        >
          {date}
        </div>
      );
    }

    return <div className={styles.calendarBody}>{dates}</div>;
  }

  // 다음 달 버튼 비활성화 여부 결정
  const isNextMonthDisabled = (() => {
    const nextMonth = displayMonth === 12 ? 1 : displayMonth + 1;
    const nextYear = displayMonth === 12 ? displayYear + 1 : displayYear;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (nextYear > currentYear) {
      return true;
    } else if (nextYear === currentYear && nextMonth > currentMonth) {
      return true;
    }
    return false;
  })();

  return (
    <div className={`${styles.datePicker} ${className || ''}`}>
      <input
        type="text"
        id={props.inputId}
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
            {!yearSelectMode && (
              <button type="button" onClick={handlePrevMonth}>
                &lt;
              </button>
            )}
            {yearSelectMode ? (
              <div className={styles.yearSelect}>
                {years.map((year) => (
                  <div key={year} onClick={() => handleYearSelect(year)} className={styles.yearOption}>
                    {year}년
                  </div>
                ))}
              </div>
            ) : (
              <div onClick={handleHeaderClick} className={styles.headerLabel}>
                {displayYear}년 {displayMonth}월
              </div>
            )}
            {!yearSelectMode && (
              <button type="button" onClick={handleNextMonth} disabled={isNextMonthDisabled}>
                &gt;
              </button>
            )}
          </div>
          {!yearSelectMode && renderCalendar()}
        </div>
      )}
    </div>
  );
}
