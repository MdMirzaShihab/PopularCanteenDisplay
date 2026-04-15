import { memo, useRef, useEffect } from 'react';
import { getLayoutTheme } from './themes/layoutRegistry';
import SectionRenderer from './SectionRenderer';
import { resolveMediaUrl } from '../../utils/mediaUtils';

const getCropStyle = (screen) => ({
  objectPosition: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
  transform: `scale(${screen.backgroundScale ?? 1})`,
  transformOrigin: `${screen.backgroundPositionX ?? 50}% ${screen.backgroundPositionY ?? 50}%`,
});

const ScreenGridRenderer = memo(({ screen }) => {
  const layout = getLayoutTheme(screen.layoutTheme);
  const bgVideoRef = useRef(null);

  // Samsung TV video health monitor — recover from silent drops
  useEffect(() => {
    if (screen.backgroundType !== 'video') return;
    const check = setInterval(() => {
      const vid = bgVideoRef.current;
      if (!vid) return;
      if (vid.paused || vid.ended || vid.readyState < 2) {
        vid.load();
        vid.play().catch(() => {});
      }
    }, 5000);
    return () => clearInterval(check);
  }, [screen.backgroundType]);

  return (
    <div className="relative w-screen h-screen overflow-hidden gallery-gpu-layer">
      {/* Background */}
      {screen.backgroundType === 'color' ? (
        <div className="absolute inset-0" style={{ backgroundColor: screen.backgroundColor || '#1a1a2e' }} />
      ) : screen.backgroundType === 'video' ? (
        <video
          ref={bgVideoRef}
          src={resolveMediaUrl(screen.backgroundMedia)}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={(e) => {
            const vid = e.currentTarget;
            setTimeout(() => { vid.load(); vid.play().catch(() => {}); }, 1000);
          }}
          onStalled={(e) => {
            const vid = e.currentTarget;
            setTimeout(() => { vid.play().catch(() => {}); }, 500);
          }}
          className="absolute inset-0 w-full h-full object-cover"
          style={getCropStyle(screen)}
        />
      ) : (
        <img
          src={resolveMediaUrl(screen.backgroundMedia)}
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
