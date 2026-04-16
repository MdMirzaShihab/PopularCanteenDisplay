import { memo } from 'react';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import { ANNOUNCEMENT_ICONS } from './AnnouncementRenderer.constants';

const PRESET_STYLES = {
  poster: {
    paddingClass: 'px-8 py-10 3xl:px-14 3xl:py-16',
    headlineClass: 'text-6xl 3xl:text-9xl uppercase tracking-[0.08em] leading-[1.02] font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]',
    subtextClass: 'font-body text-xl 3xl:text-3xl mt-6 opacity-90 tracking-wide',
    iconClass: 'w-14 h-14 3xl:w-24 3xl:h-24 mb-4 opacity-95',
    iconLayout: 'stacked',
    decoration: null,
    subtextFont: 'font-body',
  },
  notice: {
    paddingClass: 'px-10 py-8 3xl:px-16 3xl:py-14',
    headlineClass: 'text-5xl 3xl:text-7xl leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]',
    subtextClass: 'font-body text-lg 3xl:text-2xl mt-3 opacity-85',
    iconClass: 'w-10 h-10 3xl:w-16 3xl:h-16 opacity-90',
    iconLayout: 'inline-left',
    decoration: 'left-bar',
    subtextFont: 'font-body',
  },
  chalkboard: {
    paddingClass: 'px-8 py-10 3xl:px-14 3xl:py-16',
    headlineClass: 'text-6xl 3xl:text-8xl leading-[1.1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]',
    subtextClass: 'font-handwritten text-2xl 3xl:text-4xl mt-4 opacity-90',
    iconClass: 'w-12 h-12 3xl:w-20 3xl:h-20 mb-3 opacity-90',
    iconLayout: 'stacked',
    decoration: 'dashed-frame',
    subtextFont: 'font-handwritten',
  },
  banner: {
    paddingClass: 'px-8 py-6 3xl:px-12 3xl:py-8',
    headlineClass: 'text-5xl 3xl:text-7xl uppercase tracking-[0.06em] leading-none font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]',
    subtextClass: 'font-body text-base 3xl:text-xl mt-2 opacity-90 uppercase tracking-[0.2em]',
    iconClass: 'w-12 h-12 3xl:w-16 3xl:h-16',
    iconLayout: 'inline-left',
    decoration: null,
    subtextFont: 'font-body',
  },
};

const ALIGN_CLASS = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

const AnnouncementRenderer = memo(function AnnouncementRenderer({ announcement }) {
  if (!announcement) return null;

  const styleId = PRESET_STYLES[announcement.visualStyle] ? announcement.visualStyle : 'poster';
  const preset = PRESET_STYLES[styleId];

  const headline = announcement.headline || '';
  const subtext = announcement.subtext || '';
  const textAlign = announcement.textAlign || 'center';
  const textFont = announcement.textFont || 'font-heading';
  const textColor = announcement.textColor || '#ffffff';
  const backgroundMode = announcement.backgroundMode || 'color';
  const backgroundColor = announcement.backgroundColor || '#1a1a2e';
  const bgImageUrl = resolveMediaUrl(announcement.backgroundMedia);
  const IconComponent = announcement.icon ? ANNOUNCEMENT_ICONS[announcement.icon] : null;

  const showImage = (backgroundMode === 'image' || backgroundMode === 'image-overlay') && bgImageUrl;
  const fallbackToColor = !showImage;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Background layer */}
      {fallbackToColor && (
        <div className="absolute inset-0" style={{ backgroundColor }} />
      )}
      {showImage && (
        <img
          src={bgImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: 'cover',
            objectPosition: `${announcement.backgroundPositionX ?? 50}% ${announcement.backgroundPositionY ?? 50}%`,
            transform: `scale(${announcement.backgroundScale ?? 1})`,
            transformOrigin: `${announcement.backgroundPositionX ?? 50}% ${announcement.backgroundPositionY ?? 50}%`,
          }}
        />
      )}
      {showImage && backgroundMode === 'image-overlay' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: announcement.overlayColor || '#000000',
            opacity: announcement.overlayOpacity ?? 0.4,
          }}
        />
      )}

      {/* Preset decoration layer */}
      {preset.decoration === 'left-bar' && (
        <div
          className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
          style={{ backgroundColor: textColor, opacity: 0.6 }}
        />
      )}
      {preset.decoration === 'dashed-frame' && (
        <div
          className="absolute inset-3 rounded-lg pointer-events-none"
          style={{
            border: `2px dashed ${textColor}`,
            opacity: 0.4,
          }}
        />
      )}

      {/* Foreground content */}
      <div
        className={`absolute inset-0 flex flex-col justify-center ${ALIGN_CLASS[textAlign]} ${preset.paddingClass}`}
        style={{ color: textColor }}
      >
        {IconComponent && preset.iconLayout === 'stacked' && (
          <IconComponent className={preset.iconClass} strokeWidth={1.75} />
        )}

        {IconComponent && preset.iconLayout === 'inline-left' ? (
          <div className={`flex items-center gap-4 3xl:gap-6 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
            <IconComponent className={preset.iconClass} strokeWidth={1.75} />
            <h1 className={`${textFont} ${preset.headlineClass}`}>{headline}</h1>
          </div>
        ) : (
          <h1 className={`${textFont} ${preset.headlineClass}`}>{headline}</h1>
        )}

        {subtext && (
          <p className={preset.subtextClass}>{subtext}</p>
        )}
      </div>
    </div>
  );
});

export default AnnouncementRenderer;
