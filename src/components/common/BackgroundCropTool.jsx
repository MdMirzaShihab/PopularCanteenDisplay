import { useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

const DEFAULTS = { positionX: 50, positionY: 50, scale: 1 };

const BackgroundCropTool = ({ mediaUrl, mediaType, orientation, positionX, positionY, scale, onChange }) => {
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const aspectRatio = orientation === 'portrait' ? '9/16' : '16/9';

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - lastPos.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - lastPos.current.y) / rect.height) * 100;
    lastPos.current = { x: e.clientX, y: e.clientY };

    const newX = clamp(positionX - deltaX, 0, 100);
    const newY = clamp(positionY - deltaY, 0, 100);
    onChange({ positionX: Math.round(newX * 10) / 10, positionY: Math.round(newY * 10) / 10, scale });
  }, [positionX, positionY, scale, onChange]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleScaleChange = useCallback((e) => {
    const newScale = parseFloat(e.target.value);
    onChange({ positionX, positionY, scale: newScale });
  }, [positionX, positionY, onChange]);

  const handleReset = useCallback(() => {
    onChange({ ...DEFAULTS });
  }, [onChange]);

  const isDefault = positionX === DEFAULTS.positionX && positionY === DEFAULTS.positionY && scale === DEFAULTS.scale;

  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${positionX}% ${positionY}%`,
    transform: `scale(${scale})`,
    transformOrigin: `${positionX}% ${positionY}%`,
    pointerEvents: 'none',
  };

  return (
    <div className="border border-bg-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-bg-200 border-b border-bg-300 flex items-center justify-between">
        <span className="text-xs font-medium text-text-200 uppercase tracking-wider">Adjust Position</span>
        {!isDefault && (
          <button type="button" onClick={handleReset} className="flex items-center gap-1 text-xs text-primary-100 hover:text-primary-200 transition-colors">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Preview area */}
      <div className={`flex justify-center bg-black/90 ${orientation === 'portrait' ? 'p-3' : 'p-0'}`}>
        <div
          ref={containerRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ aspectRatio, width: orientation === 'portrait' ? '55%' : '100%' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Media */}
          {mediaType === 'video' ? (
            <video src={mediaUrl} autoPlay muted loop playsInline style={mediaStyle} />
          ) : (
            <img src={mediaUrl} alt="Background preview" style={mediaStyle} draggable={false} />
          )}

          {/* Crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white/50" />
          </div>

          {/* Drag hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2.5 py-0.5 rounded-full pointer-events-none">
            <span className="text-[10px] text-white/50">Drag to reposition</span>
          </div>
        </div>
      </div>

      {/* Zoom slider */}
      <div className="px-3 py-2.5 bg-bg-100 border-t border-bg-300 flex items-center gap-3">
        <span className="text-xs font-medium text-text-200">Zoom</span>
        <span className="text-xs text-text-300">−</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={scale}
          onChange={handleScaleChange}
          className="flex-1 h-1 accent-primary-100"
        />
        <span className="text-xs text-text-300">+</span>
        <span className="text-xs font-semibold text-primary-100 min-w-[2rem] text-right">{scale.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default BackgroundCropTool;
