import { useMemo, useRef, useState, useEffect, memo } from 'react';
import { getLayoutTheme } from '../gallery/themes/layoutRegistry';
import { resolveMediaUrl, normalizeContent, resolveMediaUrls } from '../../utils/mediaUtils';
import { getStyleRenderer } from '../gallery/styles/index.js';
import { useMenus } from '../../hooks/useMenus';
import MediaSlideshow from '../gallery/MediaSlideshow';

const TV_LANDSCAPE = { w: 1920, h: 1080 };
const TV_PORTRAIT = { w: 1080, h: 1920 };

const resolveContentMenus = (content, menus) => {
  if (!content || content.type !== 'menu') return content;
  const id = content.menuId?._id || content.menuId;
  if (!id || typeof id === 'object') return content;
  const menu = menus.find(m => m._id === id);
  return menu ? { ...content, menuId: menu } : content;
};

const resolveSections = (sections, menus) =>
  sections.map(s => ({
    ...s,
    defaultContent: resolveContentMenus(s.defaultContent, menus),
    timeSlots: s.timeSlots?.map(ts => ({
      ...ts,
      content: resolveContentMenus(ts.content, menus),
    })),
  }));

const PreviewSection = memo(({ section, gridArea }) => {
  const content = section.defaultContent;
  const normalized = content ? normalizeContent(content) : null;

  const sectionStyle = {
    gridArea,
    background: 'rgba(0,0,0,0.30)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  if (!normalized) {
    return (
      <div className="rounded-xl flex items-center justify-center" style={sectionStyle}>
        <span className="text-white/40 text-lg font-body">{section.label}</span>
      </div>
    );
  }

  if (normalized.type === 'menu') {
    const menu = normalized.menuId;
    if (!menu || typeof menu !== 'object') {
      return (
        <div className="rounded-xl flex items-center justify-center" style={sectionStyle}>
          <span className="text-white/40 text-lg font-body">{section.label}</span>
        </div>
      );
    }

    const menuItems = (menu.items || []).filter(Boolean).filter(item => item.isActive !== false);
    const StyleRenderer = getStyleRenderer(normalized.visualStyle);
    const titleColor = normalized.titleColor || '#ffffff';

    return (
      <div className="rounded-xl p-4 overflow-hidden flex flex-col" style={sectionStyle}>
        <div className="flex-shrink-0 mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-8 rounded-full opacity-60" style={{ backgroundColor: titleColor }} />
            <h3
              className={`${normalized.titleFont || 'font-heading'} text-2xl 3xl:text-4xl uppercase tracking-[0.15em] drop-shadow-lg`}
              style={{ color: titleColor }}
            >
              {menu.title}
            </h3>
            <div className="flex-1 h-[1px] opacity-20" style={{ backgroundColor: titleColor }} />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <StyleRenderer
            items={menuItems}
            showPrices={true}
            itemFont={normalized.itemFont}
            itemColor={normalized.itemColor}
            priceFont={normalized.priceFont}
            priceColor={normalized.priceColor}
          />
        </div>
      </div>
    );
  }

  if (normalized.type === 'media') {
    const urls = resolveMediaUrls(normalized.media);
    if (urls.length === 0) return null;
    return (
      <div className="rounded-xl overflow-hidden" style={sectionStyle}>
        <MediaSlideshow
          mediaItems={urls}
          slideDuration={normalized.slideDuration}
          transition={normalized.transition}
        />
      </div>
    );
  }

  return <div className="rounded-xl" style={{ gridArea, background: 'rgba(0,0,0,0.30)' }} />;
});

PreviewSection.displayName = 'PreviewSection';

const FoodScreenPreview = ({ formData }) => {
  const areaRef = useRef(null);
  const [frameSize, setFrameSize] = useState({ w: 400, h: 225 });
  const [scale, setScale] = useState(0.25);
  const { menus } = useMenus({ limit: 100 });

  const layout = formData ? getLayoutTheme(formData.layoutTheme) : null;
  const orientation = layout?.orientation || 'landscape';
  const tv = orientation === 'portrait' ? TV_PORTRAIT : TV_LANDSCAPE;

  const resolvedSections = useMemo(
    () => formData ? resolveSections(formData.sections || [], menus) : [],
    [formData, menus]
  );

  const cropStyle = useMemo(() => {
    if (!formData) return {};
    return (formData.backgroundType === 'image' || formData.backgroundType === 'video')
      ? {
          objectFit: 'cover',
          objectPosition: `${formData.backgroundPositionX ?? 50}% ${formData.backgroundPositionY ?? 50}%`,
          transform: `scale(${formData.backgroundScale ?? 1})`,
          transformOrigin: `${formData.backgroundPositionX ?? 50}% ${formData.backgroundPositionY ?? 50}%`,
        }
      : {};
  }, [formData]);

  /* Fit the TV frame to the largest size that fits the available area */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const { width: aw, height: ah } = entries[0].contentRect;
      if (aw <= 0 || ah <= 0) return;
      const byWidth = aw / tv.w;
      const byHeight = ah / tv.h;
      const fit = Math.min(byWidth, byHeight);
      setScale(fit);
      setFrameSize({ w: tv.w * fit, h: tv.h * fit });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [tv.w, tv.h]);

  if (!formData) return null;

  return (
    <div className="flex flex-col h-full min-h-0 px-2 pt-2 pb-1">
      {/* Header — compact */}
      <div className="flex items-center justify-between flex-shrink-0 px-1 pb-1.5">
        <span className="text-[10px] font-semibold text-text-200 uppercase tracking-[0.12em]">TV Preview</span>
        <span className="text-[10px] text-text-300">
          Samsung 43&quot; &middot; {orientation === 'portrait' ? '1080×1920' : '1920×1080'}
        </span>
      </div>

      {/* TV display area — fills all remaining space, centers the frame */}
      <div
        ref={areaRef}
        className="flex-1 min-h-0 flex items-center justify-center rounded-lg"
        style={{
          background: 'linear-gradient(145deg, #2c2c2c 0%, #1a1a1a 100%)',
          padding: '8px',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* TV frame with bezel */}
        <div
          className="relative overflow-hidden"
          style={{
            width: `${frameSize.w}px`,
            height: `${frameSize.h}px`,
            borderRadius: '4px',
            boxShadow: '0 6px 30px rgba(0,0,0,0.5), 0 0 0 2px #3a3a3a, 0 0 0 3px #222',
            background: '#000',
          }}
        >
          {/* Full-res TV surface, scaled down via CSS transform */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${tv.w}px`,
              height: `${tv.h}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
            }}
          >
            {/* Background */}
            {formData.backgroundType === 'image' && resolveMediaUrl(formData.backgroundMedia) && (
              <img
                src={resolveMediaUrl(formData.backgroundMedia)}
                alt=""
                className="absolute inset-0 w-full h-full"
                style={cropStyle}
              />
            )}
            {formData.backgroundType === 'video' && resolveMediaUrl(formData.backgroundMedia) && (
              <video
                src={resolveMediaUrl(formData.backgroundMedia)}
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full"
                style={cropStyle}
              />
            )}
            {formData.backgroundType === 'color' && (
              <div className="absolute inset-0" style={{ backgroundColor: formData.backgroundColor || '#1a1a2e' }} />
            )}
            {!formData.backgroundType && (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }} />
            )}

            {/* Section grid — identical to ScreenGridRenderer */}
            <div
              className="absolute inset-0"
              style={{
                display: 'grid',
                gridTemplateColumns: layout.grid.cols,
                gridTemplateRows: layout.grid.rows,
                gap: `${formData.gap || 8}px`,
                padding: `${formData.gap || 8}px`,
              }}
            >
              {resolvedSections.map((section, idx) => (
                <PreviewSection
                  key={section._id || section.id}
                  section={section}
                  gridArea={layout.areas[idx]?.gridArea}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pt-1 text-center">
        <p className="text-[9px] text-text-300">
          {tv.w}&times;{tv.h} &mdash; live preview
        </p>
      </div>
    </div>
  );
};

export default FoodScreenPreview;
