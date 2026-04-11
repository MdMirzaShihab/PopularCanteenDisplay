import { memo } from 'react';
import { getLayoutTheme } from './themes/layoutRegistry';
import SectionRenderer from './SectionRenderer';

const getCropStyle = (screen) => ({
  objectPosition: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
  transform: `scale(${screen.backgroundScale ?? 1})`,
  transformOrigin: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
});

const ScreenGridRenderer = memo(({ screen }) => {
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
          style={getCropStyle(screen)}
        />
      ) : (
        <img
          src={screen.backgroundMedia}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
          style={getCropStyle(screen)}
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
            key={section._id || section.id}
            section={section}
            gridArea={layout.areas[idx]?.gridArea}
          />
        ))}
      </div>
    </div>
  );
});

ScreenGridRenderer.displayName = 'ScreenGridRenderer';

export default ScreenGridRenderer;
