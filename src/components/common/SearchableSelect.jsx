import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const SearchableSelect = ({ value, onChange, options, placeholder = 'Search...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      {!isOpen ? (
        <div
          onClick={handleOpen}
          className="input-field flex items-center justify-between cursor-pointer"
        >
          <span className={value ? 'text-text-100' : 'text-text-300'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-bg-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-text-300" />
              </button>
            )}
            <ChevronDown className="w-4 h-4 text-text-300" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-300" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="input-field pl-9 pr-8"
          />
          <button
            type="button"
            onClick={() => { setIsOpen(false); setSearch(''); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-bg-200 rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-300" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-bg-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-text-300">No matches</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  opt === value
                    ? 'bg-primary-100/10 text-primary-200 font-medium'
                    : 'text-text-100 hover:bg-bg-100'
                }`}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
