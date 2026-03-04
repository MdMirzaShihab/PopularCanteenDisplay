import { Edit2, Trash2, ExternalLink, Monitor, Copy, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isVideoUrl } from '../../utils/fileUtils';
import { useNotification } from '../../context/NotificationContext';

import { getThemeById } from '../gallery/themes/themeRegistry';

const ScreenCard = ({ screen, onEdit, onDelete, onDuplicate }) => {
  const navigate = useNavigate();
  const { success } = useNotification();

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
      {/* Background Preview */}
      <div className="relative h-48 bg-gradient-to-br from-primary-300 to-primary-200 overflow-hidden">
        {screen.backgroundMedia && (
          isVideoUrl(screen.backgroundMedia) ? (
            <video src={screen.backgroundMedia}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              autoPlay muted loop playsInline />
          ) : (
            <img src={screen.backgroundMedia} alt={screen.title}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Monitor className="w-12 h-12 text-white opacity-50 group-hover:opacity-70 transition-opacity" />
        </div>
        {/* Theme Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-xs font-bold">{getThemeById(screen.theme).label}</span>
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
              <div className={`w-2 h-2 rounded-full ${screen.showPrices ? 'bg-primary-100' : 'bg-bg-300'}`} />
              <span className="text-text-100">Prices</span>
            </div>
            <div className="text-text-100">
              {screen.timeSlots?.length || 0} time slot{(screen.timeSlots?.length || 0) !== 1 ? 's' : ''}
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
