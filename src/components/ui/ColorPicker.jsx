import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Plus, Pipette, RotateCcw, Sparkles } from 'lucide-react';
import { GRAYSCALE_ROW, COLOR_GRID_ROWS, STANDARD_COLORS } from './ColorPicker.swatches';

const THEME_DEFAULT_GRADIENT = 'conic-gradient(from 0deg, #5eead4, #f472b6, #fbbf24, #a78bfa, #34d399, #5eead4)';

const ColorPicker = ({ value, defaultValue, onChange, label, renderPreview, className = '', themeDefault = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customSubpanelOpen, setCustomSubpanelOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || '#000000');
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const initialValueRef = useRef(value);

  const resetTarget = defaultValue ?? initialValueRef.current;
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const hexInputInvalid = customSubpanelOpen && hexInput.length > 0 && !/^#?[0-9a-fA-F]{6}$/.test(hexInput);
  const usingThemeDefault = themeDefault && !value;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setCustomSubpanelOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setCustomSubpanelOpen(false);
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

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      const firstSwatch = containerRef.current?.querySelector('button[data-grid-swatch="true"]');
      firstSwatch?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (customSubpanelOpen) setHexInput(value || '#000000');
  }, [customSubpanelOpen, value]);

  const handleSelect = useCallback((hex) => {
    onChange(hex.toLowerCase());
    setIsOpen(false);
  }, [onChange]);

  const handleHexSubmit = useCallback(() => {
    const normalized = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      handleSelect(normalized.toLowerCase());
      setCustomSubpanelOpen(false);
    }
  }, [hexInput, handleSelect]);

  const handleReset = useCallback(() => {
    onChange(resetTarget);
  }, [onChange, resetTarget]);

  const handleUseThemeDefault = useCallback(() => {
    onChange('');
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  const handleEyedropper = useCallback(async () => {
    if (!hasEyeDropper) return;
    try {
      const ed = new window.EyeDropper();
      const result = await ed.open();
      handleSelect(result.sRGBHex);
    } catch {
      // User cancelled the eyedropper — no-op.
    }
  }, [hasEyeDropper, handleSelect]);

  const handleGridKeyDown = useCallback((e) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const buttons = Array.from(
      e.currentTarget.querySelectorAll('button[data-grid-swatch="true"]')
    );
    const currentIdx = buttons.indexOf(document.activeElement);
    if (currentIdx === -1) return;
    const cols = 10;
    let nextIdx = currentIdx;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + buttons.length) % buttons.length;
    else if (e.key === 'ArrowDown') {
      const newRow = Math.floor(currentIdx / cols) + 1;
      nextIdx = newRow * cols + (currentIdx % cols);
      if (nextIdx >= buttons.length) nextIdx = currentIdx;
    } else if (e.key === 'ArrowUp') {
      const newRow = Math.floor(currentIdx / cols) - 1;
      nextIdx = newRow >= 0 ? newRow * cols + (currentIdx % cols) : currentIdx;
    }
    buttons[nextIdx]?.focus();
  }, []);

  const isHexInBuiltInPalette = useCallback((hex) => {
    const lower = (hex || '').toLowerCase();
    if (GRAYSCALE_ROW.includes(lower)) return true;
    if (STANDARD_COLORS.map(c => c.toLowerCase()).includes(lower)) return true;
    return COLOR_GRID_ROWS.some(row => row.includes(lower));
  }, []);

  const currentLower = (value || '').toLowerCase();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-100 mb-2">{label}</label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-bg-300 rounded-lg bg-white hover:border-primary-100 transition-colors w-full"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {usingThemeDefault ? (
          <>
            <span
              className="w-6 h-6 rounded border-2 border-dashed border-bg-300 shrink-0"
              style={{ background: THEME_DEFAULT_GRADIENT }}
            />
            <span className="text-sm text-text-200 italic flex-1 text-left">Style default</span>
          </>
        ) : (
          <>
            <span
              className="w-6 h-6 rounded border border-bg-300 shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-text-100 font-mono flex-1 text-left">{value}</span>
          </>
        )}
        <ChevronDown size={16} className="text-text-200" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-[280px] bg-white border border-bg-300 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-text-200 hover:text-primary-100"
            >
              <RotateCcw size={12} />
              Reset
            </button>
            {themeDefault && (
              <button
                type="button"
                onClick={handleUseThemeDefault}
                disabled={usingThemeDefault}
                className="flex items-center gap-1 text-xs text-text-200 hover:text-primary-100 disabled:opacity-50 disabled:cursor-default"
                aria-label="Use style default color"
              >
                <Sparkles size={12} />
                Style default
              </button>
            )}
          </div>

          <div
            className="grid grid-cols-10 gap-1 mb-3"
            onKeyDown={handleGridKeyDown}
            role="group"
            aria-label="Color palette"
          >
            {GRAYSCALE_ROW.map(color => (
              <Swatch
                key={color}
                color={color}
                active={color === currentLower}
                onClick={() => handleSelect(color)}
              />
            ))}
            {COLOR_GRID_ROWS.flat().map(color => (
              <Swatch
                key={color}
                color={color}
                active={color === currentLower}
                onClick={() => handleSelect(color)}
              />
            ))}
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-semibold text-text-200 tracking-wide mb-1">STANDARD</div>
            <div className="flex gap-1.5">
              {STANDARD_COLORS.map(color => (
                <CircleSwatch
                  key={color}
                  color={color}
                  active={color.toLowerCase() === currentLower}
                  onClick={() => handleSelect(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-text-200 tracking-wide mb-1">CUSTOM</div>
            <div className="flex items-center gap-1.5">
              {!isHexInBuiltInPalette(value) && value && (
                <CircleSwatch color={value} active onClick={() => handleSelect(value)} />
              )}
              <button
                type="button"
                onClick={() => setCustomSubpanelOpen(!customSubpanelOpen)}
                className="w-6 h-6 rounded-full border border-bg-300 flex items-center justify-center hover:border-primary-100"
                aria-label="Pick custom color"
              >
                <Plus size={12} className="text-text-200" />
              </button>
              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyedropper}
                  className="w-6 h-6 rounded-full border border-bg-300 flex items-center justify-center hover:border-primary-100"
                  aria-label="Pick color from screen"
                >
                  <Pipette size={12} className="text-text-200" />
                </button>
              )}
            </div>

            {customSubpanelOpen && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={hexInput.startsWith('#') ? hexInput : `#${hexInput}`}
                  onChange={(e) => setHexInput(e.target.value)}
                  className="w-8 h-8 rounded border border-bg-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleHexSubmit();
                    }
                  }}
                  placeholder="#000000"
                  maxLength={7}
                  className={`flex-1 min-w-0 px-2 py-1 text-xs font-mono border rounded focus:outline-none ${
                    hexInputInvalid
                      ? 'border-accent-200 focus:border-accent-200'
                      : 'border-bg-300 focus:border-primary-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleHexSubmit}
                  disabled={!/^#?[0-9a-fA-F]{6}$/.test(hexInput)}
                  className="p-1 rounded bg-primary-100 text-white disabled:bg-bg-300 disabled:cursor-not-allowed hover:bg-primary-200 shrink-0"
                  aria-label="Apply hex color"
                >
                  <Check size={12} />
                </button>
              </div>
            )}
          </div>

          {renderPreview && value && (
            <div className="mt-3 pt-3 border-t border-bg-300">
              {renderPreview({ color: value })}
            </div>
          )}
          {renderPreview && !value && themeDefault && (
            <div className="mt-3 pt-3 border-t border-bg-300 flex items-center gap-2 text-xs text-text-200 italic">
              <span
                className="w-5 h-5 rounded border border-dashed border-bg-300 shrink-0"
                style={{ background: THEME_DEFAULT_GRADIENT }}
              />
              Color comes from the chosen visual style
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Swatch = ({ color, active, onClick }) => (
  <button
    type="button"
    data-grid-swatch="true"
    onClick={onClick}
    className={`w-full aspect-square rounded border transition-all ${
      active
        ? 'ring-2 ring-primary-100 ring-offset-1 border-transparent'
        : 'border-bg-300/50 hover:border-text-200'
    } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-200`}
    style={{ backgroundColor: color }}
    aria-label={`Color ${color}`}
    aria-pressed={active}
  >
    {active && <Check size={10} className="text-white drop-shadow" />}
  </button>
);

const CircleSwatch = ({ color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-6 h-6 rounded-full border transition-all ${
      active
        ? 'ring-2 ring-primary-100 ring-offset-1 border-transparent'
        : 'border-bg-300/50 hover:border-text-200'
    }`}
    style={{ backgroundColor: color }}
    aria-label={`Color ${color}`}
    aria-pressed={active}
  />
);

export default ColorPicker;
