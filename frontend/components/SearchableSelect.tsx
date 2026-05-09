'use client';

import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  keywords?: string[];
}

interface Props {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  onInspectOption?: (option: SelectOption) => void;
  inspectLabel?: string;
}

export default function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder = 'เลือก...',
  disabled = false,
  emptyMessage = 'ไม่พบรายการ',
  searchPlaceholder = 'ค้นหา...',
  className = '',
  onInspectOption,
  inspectLabel = 'ดู',
}: Props) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const containerRef          = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = options.filter(o => {
    const q = search.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      o.keywords?.some(k => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); setSearch(''); }
  }

  function select(opt: SelectOption) {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white text-left transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-primary-400 cursor-pointer'}
          ${open ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-300'}`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected?.label ?? placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-gray-400">{emptyMessage}</li>
            ) : filtered.map(opt => (
              <li key={opt.value}>
                <div
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-primary-50 transition-colors
                    ${opt.value === value ? 'bg-primary-50 text-primary-700' : 'text-gray-800'}`}
                  onClick={() => select(opt)}
                >
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    {opt.description && (
                      <div className="text-xs text-gray-400 mt-0.5">{opt.description}</div>
                    )}
                  </div>
                  {onInspectOption && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onInspectOption(opt); }}
                      className="ml-2 px-2 py-0.5 text-xs border border-gray-200 rounded text-gray-500 hover:bg-gray-100 flex-shrink-0"
                    >
                      {inspectLabel}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
