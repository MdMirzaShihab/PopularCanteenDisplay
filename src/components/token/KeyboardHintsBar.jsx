import { Keyboard } from 'lucide-react';

const Key = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-[11px] font-semibold text-text-100 bg-white border border-bg-300 rounded shadow-sm">
    {children}
  </kbd>
);

const Hint = ({ keys, label, dim = false }) => (
  <div className={`flex items-center gap-1.5 ${dim ? 'opacity-50' : ''}`}>
    <span className="flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-text-300 text-[10px]">+</span>}
          <Key>{k}</Key>
        </span>
      ))}
    </span>
    <span className="text-xs text-text-200">{label}</span>
  </div>
);

const KeyboardHintsBar = ({ canCallNext, canClear }) => {
  return (
    <div className="hidden sm:flex items-center flex-wrap gap-x-4 gap-y-2 px-3 py-2 bg-bg-100 border border-bg-300 rounded-lg">
      <div className="flex items-center gap-1.5 text-text-200">
        <Keyboard className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Shortcuts</span>
      </div>
      <Hint keys={['Enter']} label="Call" />
      <Hint keys={['Alt', 'N']} label="Next number" dim={!canCallNext} />
      <Hint keys={['Alt', 'R']} label="Re-announce" />
      <Hint keys={['Alt', 'Z']} label="Undo" />
      <Hint keys={['Esc']} label="Clear input" dim={!canClear} />
    </div>
  );
};

export default KeyboardHintsBar;
