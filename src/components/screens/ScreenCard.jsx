import { Edit2, Trash2, ExternalLink, Monitor, Copy, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { getLayoutTheme } from '../gallery/themes/layoutRegistry';

const LayoutMiniature = ({ layout }) => (
  <div
    className="w-full aspect-video rounded border border-bg-300 overflow-hidden"
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

const ScreenCard = ({ screen, onEdit, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const { success } = useNotification();

  const layout = getLayoutTheme(screen.layoutTheme);
  const totalSlots = (screen.sections || []).reduce((sum, s) => sum + (s.timeSlots?.length || 0), 0);

  const handlePreview = () => {
    navigate(`/gallery/${screen.id}`);
  };

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/gallery/${screen.id}`;
    try {
      await navigator.clipboard.writeText(url);
      success('Display URL copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('Display URL copied to clipboard!');
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Layout Preview */}
      <div className="relative h-48 bg-gradient-to-br from-primary-300 to-primary-200 overflow-hidden flex items-center justify-center p-6">
        <div className="w-full max-w-[180px]">
          <LayoutMiniature layout={layout} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Layout Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-xs font-bold">{layout.label}</span>
          </div>
        </div>
        {/* Section Count Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-white/90 text-text-100 px-2.5 py-1 rounded-lg shadow-sm">
            <span className="text-xs font-medium">{layout.sections} {layout.sections === 1 ? 'section' : 'sections'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-primary-100 transition-colors line-clamp-1">{screen.title}</h3>

        {/* Info */}
        <div className="mb-4 p-3 bg-bg-100/50 rounded-lg border border-bg-300">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-primary-100" />
              <span className="text-text-100">{layout.label}</span>
            </div>
            <div className="text-text-100">
              {totalSlots} time slot{totalSlots !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <button onClick={handlePreview}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Copy Display URL">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDuplicate(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-100 bg-accent-100/10 rounded-lg hover:bg-accent-100/20 transition-all duration-200 border border-transparent hover:border-accent-100"
            title="Duplicate Screen">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <button onClick={() => onDelete(screen)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-200 bg-accent-200/10 rounded-lg hover:bg-accent-200/20 transition-all duration-200 border border-transparent hover:border-accent-200">
          <Trash2 className="w-4 h-4" />
          Delete Screen
        </button>
      </div>
    </div>
  );
};

export default ScreenCard;
