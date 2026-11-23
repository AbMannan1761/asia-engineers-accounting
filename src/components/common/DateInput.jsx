import React, { useRef, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react';

const MONTHS_BN = [
  'জানুয়ারি (Jan)', 'ফেব্রুয়ারি (Feb)', 'মার্চ (Mar)', 'এপ্রিল (Apr)',
  'মে (May)', 'জুন (Jun)', 'জুলাই (Jul)', 'আগস্ট (Aug)',
  'সেপ্টেম্বর (Sep)', 'অক্টোবর (Oct)', 'নভেম্বর (Nov)', 'ডিসেম্বর (Dec)'
];

const DAYS_HEADER = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

/**
 * Reusable DateInput component with an interactive custom Calendar Popup.
 * Features:
 * - Displays and formats dates in DD-MM-YYYY format (e.g. 03-02-2026).
 * - Has explicit "ওকে" (OK) confirmation button to apply date and close.
 * - Quick "আজকে" (Today) and "ক্লিয়ার" (Clear) buttons.
 * - Month & Year dropdowns with Prev/Next controls.
 * - Full manual typing support.
 * - Smart upward/downward auto-positioning and click-outside close.
 */
export const DateInput = ({
  value,
  onChange,
  className = '',
  required = false,
  placeholder = 'DD-MM-YYYY',
  id,
  name,
  disabled = false
}) => {
  // Convert standard YYYY-MM-DD to DD-MM-YYYY
  const toDisplayFormat = (isoStr) => {
    if (!isoStr) return '';
    const clean = String(isoStr).split('T')[0].trim();
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    }
    return clean;
  };

  // Convert DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD to YYYY-MM-DD
  const toIsoFormat = (displayStr) => {
    if (!displayStr) return '';
    const clean = displayStr.replace(/\//g, '-').trim();
    const parts = clean.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4 && parts[1].length <= 2 && parts[2].length <= 2) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      const [d, m, y] = parts;
      if (y.length === 4 && d.length <= 2 && m.length <= 2) {
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
    return '';
  };

  // Parse any date representation into { year, month (0-11), day }
  const parseDateParts = (val) => {
    if (!val) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }
    const iso = toIsoFormat(val) || val;
    const parts = String(iso).split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        day: parseInt(parts[2], 10)
      };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  };

  const [displayText, setDisplayText] = useState(() => toDisplayFormat(value));
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);

  const initialParts = parseDateParts(value);
  const [viewYear, setViewYear] = useState(initialParts.year);
  const [viewMonth, setViewMonth] = useState(initialParts.month);
  const [selectedDate, setSelectedDate] = useState(() => value ? parseDateParts(value) : null);

  const containerRef = useRef(null);

  useEffect(() => {
    setDisplayText(toDisplayFormat(value));
    if (value) {
      const parsed = parseDateParts(value);
      setSelectedDate(parsed);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Handle click outside & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleCalendar = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 340 && rect.top > 340) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      const current = parseDateParts(value || displayText);
      setViewYear(current.year);
      setViewMonth(current.month);
      if (value || displayText) {
        setSelectedDate(current);
      }
    }
    setIsOpen(prev => !prev);
  };

  // Manual typing handler
  const handleTextChange = (e) => {
    const raw = e.target.value;
    setDisplayText(raw);
    const iso = toIsoFormat(raw);
    if (iso && onChange) {
      const parsed = parseDateParts(iso);
      setSelectedDate(parsed);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      onChange({ target: { value: iso, name } });
    }
  };

  // Month navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Click on a day
  const handleDaySelect = (day, m = viewMonth, y = viewYear) => {
    const chosen = { year: y, month: m, day };
    setSelectedDate(chosen);
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const display = `${String(day).padStart(2, '0')}-${String(m + 1).padStart(2, '0')}-${y}`;
    setDisplayText(display);
    if (onChange) {
      onChange({ target: { value: iso, name } });
    }
  };

  // The explicit "ওকে" (OK) button confirmation
  const handleConfirmOK = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedDate) {
      const iso = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
      const display = `${String(selectedDate.day).padStart(2, '0')}-${String(selectedDate.month + 1).padStart(2, '0')}-${selectedDate.year}`;
      setDisplayText(display);
      if (onChange) {
        onChange({ target: { value: iso, name } });
      }
    }
    setIsOpen(false);
  };

  // Set today
  const handleSetToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    setSelectedDate(today);
    setViewYear(today.year);
    setViewMonth(today.month);
    const iso = `${today.year}-${String(today.month + 1).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    const display = `${String(today.day).padStart(2, '0')}-${String(today.month + 1).padStart(2, '0')}-${today.year}`;
    setDisplayText(display);
    if (onChange) {
      onChange({ target: { value: iso, name } });
    }
  };

  // Clear date
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setDisplayText('');
    if (onChange) {
      onChange({ target: { value: '', name } });
    }
    setIsOpen(false);
  };

  // Compute days for calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentMonthDays.push(d);
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = (7 - (totalCells % 7)) % 7;
  const nextMonthDays = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push(d);
  }

  // Today marker
  const today = new Date();
  const isToday = (day) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const isSelected = (day) => {
    return selectedDate && selectedDate.year === viewYear && selectedDate.month === viewMonth && selectedDate.day === day;
  };

  // Generate Year options (from 2018 to 2035)
  const yearOptions = [];
  for (let y = 2018; y <= 2035; y++) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className="relative flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        value={displayText}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={`w-full pr-10 font-mono tracking-wider ${className}`}
      />

      {/* Calendar Icon Button */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={toggleCalendar}
        className="absolute right-2.5 text-amber-400 hover:text-amber-300 p-1.5 rounded-lg transition hover:bg-slate-700/40 cursor-pointer"
        title="ক্যালেন্ডার খুলুন (DD-MM-YYYY)"
      >
        <Calendar className="w-4 h-4 pointer-events-none" />
      </button>

      {/* Custom Interactive React Calendar Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          } z-50 w-72 sm:w-80 bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-3.5 text-xs select-none animate-in fade-in zoom-in-95 duration-150 date-picker-popup`}
          style={{ minWidth: '280px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header: Month & Year Selector + Prev/Next Buttons */}
          <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="পূর্ববর্তী মাস"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {MONTHS_BN.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="পরবর্তী মাস"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-bold text-amber-400/90 border-b border-slate-800/80">
            {DAYS_HEADER.map((day, idx) => (
              <div key={idx} className={idx === 5 ? 'text-rose-400' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center py-2">
            {/* Trailing days of previous month */}
            {prevMonthDays.map((d, i) => (
              <div
                key={`prev-${i}`}
                onClick={() => {
                  const m = viewMonth === 0 ? 11 : viewMonth - 1;
                  const y = viewMonth === 0 ? viewYear - 1 : viewYear;
                  setViewMonth(m);
                  setViewYear(y);
                  handleDaySelect(d, m, y);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-400 text-xs rounded-lg cursor-pointer transition"
              >
                {d}
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((d) => {
              const selected = isSelected(d);
              const currentDay = isToday(d);
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleDaySelect(d)}
                  onDoubleClick={handleConfirmOK}
                  className={`p-1.5 text-xs rounded-xl font-semibold transition-all cursor-pointer relative ${
                    selected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                      : currentDay
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {d}
                  {currentDay && !selected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Leading days of next month */}
            {nextMonthDays.map((d, i) => (
              <div
                key={`next-${i}`}
                onClick={() => {
                  const m = viewMonth === 11 ? 0 : viewMonth + 1;
                  const y = viewMonth === 11 ? viewYear + 1 : viewYear;
                  setViewMonth(m);
                  setViewYear(y);
                  handleDaySelect(d, m, y);
                }}
                className="p-1.5 text-slate-600 hover:text-slate-400 text-xs rounded-lg cursor-pointer transition"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Footer Action Buttons with Explicit OK Button */}
          <div className="pt-2.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
                title="আজকের তারিখ সিলেক্ট করুন"
              >
                আজকে
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="তারিখ মুছুন"
              >
                ক্লিয়ার
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                বাতিল
              </button>
              {/* THE REQUESTED OK BUTTON */}
              <button
                type="button"
                onClick={handleConfirmOK}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ওকে (OK)</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
