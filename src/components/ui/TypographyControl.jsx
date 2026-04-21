import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import ColorPicker from './ColorPicker';
import SizePicker from './SizePicker';
import { FONT_CHOICES } from '../../utils/constants';

const FontTrigger = ({ value, sampleMap, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const currentFont = FONT_CHOICES.find(f => f.id === value) || FONT_CHOICES[0];

  const handleSelect = useCallback((id) => {
    onChange(id);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 border border-bg-300 rounded-lg bg-white hover:border-primary-100 transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-100"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Font: ${currentFont.label}`}
      >
        <span className={`${currentFont.id} text-xl leading-none text-text-100 w-7 text-center flex-shrink-0`}>
          Aa
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-text-200 uppercase tracking-wide leading-none">
            Font
          </span>
          <span className="text-sm text-text-100 truncate leading-tight mt-0.5">
            {currentFont.label}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-text-200 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-bg-300 rounded-lg shadow-xl p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1">
            {FONT_CHOICES.map(font => {
              const isSelected = value === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleSelect(font.id)}
                  className={`relative p-2 rounded-lg border transition-colors text-center focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    isSelected
                      ? 'border-primary-100 bg-primary-50'
                      : 'border-bg-300 bg-white hover:border-primary-100/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <Check size={10} className="absolute top-1 right-1 text-primary-100" />
                  )}
                  <span className={`${font.id} text-lg leading-tight block ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                    {sampleMap?.[font.id] || 'Aa'}
                  </span>
                  <span className="block text-[10px] text-text-200 mt-0.5">{font.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const TypographyControl = ({
  label,
  description,
  renderPreview,
  previewBackground = '#1a1a2e',

  font,
  onFontChange,
  fontSample,

  size,
  onSizeChange,

  color,
  onColorChange,
  colorDefault,
  colorThemeDefault = false,

  className = '',
}) => {
  const hasFont = typeof onFontChange === 'function';
  const hasSize = typeof onSizeChange === 'function';
  const hasColor = typeof onColorChange === 'function';

  return (
    <div className={`rounded-xl border border-bg-300 bg-white/40 ${className}`}>
      {(label || description) && (
        <div className="px-4 pt-3 pb-1">
          {label && (
            <h4 className="text-xs font-semibold text-text-100 uppercase tracking-[0.1em]">
              {label}
            </h4>
          )}
          {description && (
            <p className="text-xs text-text-200 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {renderPreview && (
        <div
          className="mx-4 mt-2 rounded-lg overflow-hidden border border-bg-300"
          style={{ backgroundColor: previewBackground }}
        >
          <div className="py-4 px-3 min-h-[64px] flex items-center justify-center text-center">
            {renderPreview({ font, size, color })}
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-4 space-y-3">
        {hasFont && (
          <FontTrigger value={font} sampleMap={fontSample} onChange={onFontChange} />
        )}

        {(hasSize || hasColor) && (
          <div className={`grid gap-3 grid-cols-1 ${hasSize && hasColor ? 'sm:grid-cols-2' : ''}`}>
            {hasSize && (
              <SizePicker value={size} onChange={onSizeChange} />
            )}
            {hasColor && (
              <ColorPicker
                value={color}
                defaultValue={colorDefault}
                themeDefault={colorThemeDefault}
                onChange={onColorChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypographyControl;
