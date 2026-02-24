import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({
  value,
  onChange,
  onSelect,
  searchFn,
  renderItem,
  placeholder = 'Rechercher...',
  debounceMs = 150,
  allowCustom = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Position the dropdown relative to the input
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 340),
    });
  }, []);

  // When dropdown opens, clear search to show all
  useEffect(() => {
    if (isOpen) {
      setSearchText('');
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [isOpen, updatePosition]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await searchFn(searchText);
        setResults(items);
        setHighlightedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, searchText ? debounceMs : 0);
    return () => clearTimeout(debounceRef.current);
  }, [searchText, isOpen, searchFn, debounceMs]);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !dropdownRef.current) return;
    const el = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleItemSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, highlightedIndex]);

  const handleItemSelect = useCallback((item) => {
    onSelect(item);
    setIsOpen(false);
    setSearchText('');
    inputRef.current?.blur();
  }, [onSelect]);

  const handleInputChange = useCallback((e) => {
    setSearchText(e.target.value);
    if (onChange) onChange(e.target.value);
  }, [onChange]);

  const displayValue = isOpen ? searchText : (value || '');

  const defaultRenderItem = (item, query) => (
    <div className="ss-item-content">
      <span className="ss-item-name">{highlightMatch(item.nom, query)}</span>
      <span className="ss-item-detail">
        {item.rgt} · {item.type === 'support' ? 'Support' : 'Arom.'} · {item.prix}€/kg
      </span>
    </div>
  );

  const dropdown = isOpen ? createPortal(
    <ul
      ref={dropdownRef}
      className="ss-dropdown"
      role="listbox"
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
      }}
    >
      {loading && <li className="ss-status">Recherche...</li>}
      {!loading && results.length === 0 && (
        <li className="ss-status">
          {allowCustom ? 'Aucun résultat — saisie libre' : 'Aucun résultat'}
        </li>
      )}
      {!loading && results.map((item, i) => (
        <li
          key={item.rgt || i}
          data-index={i}
          className={`ss-option ${i === highlightedIndex ? 'ss-option--active' : ''}`}
          onMouseEnter={() => setHighlightedIndex(i)}
          onMouseDown={(e) => { e.preventDefault(); handleItemSelect(item); }}
          role="option"
          aria-selected={i === highlightedIndex}
        >
          {(renderItem || defaultRenderItem)(item, searchText)}
        </li>
      ))}
    </ul>,
    document.body
  ) : null;

  return (
    <div className="ss" ref={containerRef}>
      <input
        ref={inputRef}
        className="ss-input"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={isOpen ? 'Taper pour filtrer...' : (placeholder || 'Sélectionner...')}
        role="combobox"
        aria-expanded={isOpen}
        autoComplete="off"
        spellCheck={false}
      />
      <svg className="ss-chevron" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
      {dropdown}
    </div>
  );
}

export function highlightMatch(text, query) {
  if (!query?.trim()) return text;
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="ss-match">{part}</mark>
      : part
  );
}
