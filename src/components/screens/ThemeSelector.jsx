import { THEME_REGISTRY } from '../gallery/themes/themeRegistry';

const GROUPS = [
  { key: 'portrait', label: 'Portrait Themes' },
  { key: 'landscape', label: 'Landscape Themes' },
  { key: 'special', label: 'Special Modes' },
];

const ThemeSelector = ({ value, onChange, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-100 mb-3">
        Display Theme *
      </label>
      <div className="space-y-5">
        {GROUPS.map(group => {
          const themes = THEME_REGISTRY.filter(t => t.group === group.key);
          if (themes.length === 0) return null;
          return (
            <div key={group.key}>
              <p className="text-xs font-semibold text-text-300 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = value === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onChange(theme.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-100 bg-primary-100/10 shadow-md'
                          : 'border-bg-300 bg-white hover:border-primary-100/50 hover:bg-bg-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100 text-white' : 'bg-bg-200 text-text-200'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-primary-100' : 'text-text-100'}`}>
                          {theme.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-200 leading-relaxed">
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-accent-200">{error}</p>}
    </div>
  );
};

export default ThemeSelector;
