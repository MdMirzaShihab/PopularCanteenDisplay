import { Monitor, Smartphone } from 'lucide-react';
import { LAYOUT_THEMES } from '../gallery/themes/layoutRegistry';

const LayoutMiniature = ({ layout }) => (
  <div
    className={`rounded border border-bg-300 overflow-hidden ${
      layout.orientation === 'portrait' ? 'aspect-[9/16] h-32 mx-auto' : 'w-full aspect-video'
    }`}
    style={{
      display: 'grid',
      gridTemplateColumns: layout.grid.cols,
      gridTemplateRows: layout.grid.rows,
      gap: '2px',
      padding: '2px'
    }}
  >
    {layout.areas.map((area, idx) => (
      <div
        key={area.id}
        className="rounded-sm"
        style={{
          gridArea: area.gridArea,
          backgroundColor: `rgba(143, 151, 121, ${0.2 + idx * 0.12})`
        }}
      />
    ))}
  </div>
);

const LayoutGroup = ({ title, icon: Icon, layouts, value, onChange }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary-100" />
      <h4 className="font-body text-sm font-semibold text-text-100">{title}</h4>
      <span className="text-xs text-text-200">({layouts.length} layouts)</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {layouts.map(layout => {
        const isSelected = value === layout.id;
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? 'border-primary-100 bg-primary-50'
                : 'border-bg-300 hover:border-primary-100'
            }`}
          >
            <div className="flex justify-center">
              <LayoutMiniature layout={layout} />
            </div>
            <div className="mt-2">
              <p className="font-body text-sm font-medium text-text-100">{layout.label}</p>
              <p className="font-body text-xs text-text-200">{layout.sections} {layout.sections === 1 ? 'section' : 'sections'}</p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const LayoutPicker = ({ value, onChange }) => {
  const allLayouts = Object.values(LAYOUT_THEMES);
  const landscapeLayouts = allLayouts.filter(l => l.orientation === 'landscape');
  const portraitLayouts = allLayouts.filter(l => l.orientation === 'portrait');

  return (
    <div className="space-y-6">
      <LayoutGroup
        title="Landscape"
        icon={Monitor}
        layouts={landscapeLayouts}
        value={value}
        onChange={onChange}
      />
      <LayoutGroup
        title="Portrait"
        icon={Smartphone}
        layouts={portraitLayouts}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default LayoutPicker;
