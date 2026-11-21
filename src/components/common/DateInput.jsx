import React, { useRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Reusable DateInput component that formats and displays dates in DD-MM-YYYY format
 * e.g. 21-11-2026, while providing native calendar popup picker and text typing support.
 */
export const DateInput = ({
  value,
  onChange,
  className = '',
  required = false,
  placeholder = 'DD-MM-YYYY',
  id,
  name
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

  const [displayText, setDisplayText] = useState(() => toDisplayFormat(value));
  const hiddenDateRef = useRef(null);

  useEffect(() => {
    setDisplayText(toDisplayFormat(value));
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setDisplayText(raw);
    const iso = toIsoFormat(raw);
    if (iso && onChange) {
      onChange({ target: { value: iso, name } });
    }
  };

  const handleHiddenDateChange = (e) => {
    const iso = e.target.value;
    if (iso && onChange) {
      setDisplayText(toDisplayFormat(iso));
      onChange({ target: { value: iso, name } });
    }
  };

  const openCalendar = () => {
    if (hiddenDateRef.current) {
      try {
        if (typeof hiddenDateRef.current.showPicker === 'function') {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.focus();
        }
      } catch (err) {
        hiddenDateRef.current.focus();
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        required={required}
        value={displayText}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={`w-full pr-10 font-mono tracking-wider ${className}`}
      />

      {/* Calendar Icon Button with overlaid native picker for 100% cross-browser reliability */}
      <div className="absolute right-2.5 flex items-center justify-center pointer-events-auto">
        <button
          type="button"
          tabIndex={-1}
          onClick={openCalendar}
          className="text-amber-400 hover:text-amber-300 p-1 rounded transition"
          title="ক্যালেন্ডার খুলুন (DD-MM-YYYY)"
        >
          <Calendar className="w-4 h-4 pointer-events-none" />
        </button>
        {/* Hidden native date input to trigger browser's calendar */}
        <input
          ref={hiddenDateRef}
          type="date"
          tabIndex={-1}
          value={value || ''}
          onChange={handleHiddenDateChange}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
    </div>
  );
};
