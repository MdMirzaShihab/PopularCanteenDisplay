import { Monitor, Smartphone, Film, Image } from 'lucide-react';

const THEMES = [
  {
    id: 'classic-grid',
    label: 'Classic Grid',
    description: 'Landscape layout with menu cards in a grid',
    icon: Monitor,
  },
  {
    id: 'portrait-list',
    label: 'Portrait List',
    description: 'Vertical layout for tall/rotated screens',
    icon: Smartphone,
  },
  {
    id: 'media-focus',
    label: 'Media Focus',
    description: 'Grid layout with a promotional media window',
    icon: Film,
  },
  {
    id: 'none',
    label: 'No Theme',
    description: 'Background media fills the entire screen',
    icon: Image,
  },
];

const ThemeSelector = ({ value, onChange, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-100 mb-3">
        Display Theme *
      </label>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => {
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
      {error && <p className="mt-2 text-sm text-accent-200">{error}</p>}
    </div>
  );
};

export default ThemeSelector;
