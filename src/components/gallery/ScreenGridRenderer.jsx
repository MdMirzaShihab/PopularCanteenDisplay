import { memo } from 'react';
import { useData } from '../../context/DataContext';
import { getLayoutTheme } from './themes/layoutRegistry';
import SectionRenderer from './SectionRenderer';

const ScreenGridRenderer = memo(({ screen }) => {
  const { items, menus } = useData();
  const layout = getLayoutTheme(screen.layoutTheme);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      {screen.backgroundType === 'color' ? (
        <div className="absolute inset-0" style={{ backgroundColor: screen.backgroundColor || '#1a1a2e' }} />
      ) : screen.backgroundType === 'video' ? (
        <video
          src={screen.backgroundMedia}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={screen.backgroundMedia}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      )}

      {/* Grid */}
      <div
        className="relative w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: layout.grid.cols,
          gridTemplateRows: layout.grid.rows,
          gap: `${screen.gap || 8}px`,
          padding: `${screen.gap || 8}px`
        }}
      >
        {screen.sections.map((section, idx) => (
          <SectionRenderer
            key={section.id}
            section={section}
            items={items}
            menus={menus}
            gridArea={layout.areas[idx]?.gridArea}
          />
        ))}
      </div>
    </div>
  );
});

ScreenGridRenderer.displayName = 'ScreenGridRenderer';

export default ScreenGridRenderer;
