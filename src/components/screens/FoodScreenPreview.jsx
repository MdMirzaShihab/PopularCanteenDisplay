import { getLayoutTheme } from '../gallery/themes/layoutRegistry';
import { resolveMediaUrl } from '../../utils/mediaUtils';

const FoodScreenPreview = ({ formData }) => {
  if (!formData) return null;

  const layout = getLayoutTheme(formData.layoutTheme);
  const orientation = layout.orientation || 'landscape';
  const aspectRatio = orientation === 'portrait' ? '9/16' : '16/9';

  const cropStyle = (formData.backgroundType === 'image' || formData.backgroundType === 'video')
    ? {
        objectFit: 'cover',
        objectPosition: `${formData.backgroundPositionX ?? 50}% ${formData.backgroundPositionY ?? 50}%`,
        transform: `scale(${formData.backgroundScale ?? 1})`,
        transformOrigin: `${formData.backgroundPositionX ?? 50}% ${formData.backgroundPositionY ?? 50}%`,
      }
    : {};

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-200 uppercase tracking-wider">Preview</span>
        <span className="text-xs text-text-300">
          {orientation === 'portrait' ? '9:16 Portrait' : '16:9 Landscape'}
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-bg-300 mx-auto"
        style={{
          aspectRatio,
          width: orientation === 'portrait' ? '60%' : '100%',
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
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full"
            style={cropStyle}
          />
        )}
        {formData.backgroundType === 'color' && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: formData.backgroundColor || '#1a1a2e' }}
          />
        )}
        {!formData.backgroundType && (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
          />
        )}

        {/* Section grid overlay */}
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
          {layout.areas.map((area) => (
            <div
              key={area.id}
              className="rounded-lg flex items-center justify-center"
              style={{
                gridArea: area.gridArea,
                border: '1px dashed rgba(255,255,255,0.35)',
                background: 'rgba(0,0,0,0.15)',
              }}
            >
              <span className="text-xs text-white/60 font-medium text-center px-1">
                {area.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-text-300 text-center">Updates as you edit</p>
    </div>
  );
};

export default FoodScreenPreview;
