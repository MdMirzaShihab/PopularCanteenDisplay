import { Edit2, Trash2, ExternalLink, Monitor, Copy } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isVideoUrl } from '../../utils/fileUtils';

const ScreenCard = ({ screen, onEdit, onDelete, onDuplicate }) => {
  const { getScheduleById } = useData();
  const schedule = getScheduleById(screen.scheduleId);

  const handlePreview = () => {
    window.open(`/gallery/${screen.id}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100">
      {/* Background Preview */}
      <div className="relative h-48 bg-gradient-to-br from-primary-300 to-primary-200 overflow-hidden">
        {screen.backgroundMedia && (
          isVideoUrl(screen.backgroundMedia) ? (
            <video
              src={screen.backgroundMedia}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              muted
            />
          ) : (
            <img
              src={screen.backgroundMedia}
              alt={screen.title}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
            />
          )
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <Monitor className="w-12 h-12 text-white opacity-50 group-hover:opacity-70 transition-opacity" />
        </div>

        {/* Display Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="text-xs font-bold">16:9 Display</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-primary-100 transition-colors line-clamp-1">{screen.title}</h3>

        {/* Schedule Info */}
        <div className="mb-4 pt-3 border-t border-bg-300">
          <p className="text-xs font-semibold text-text-200 uppercase tracking-wide mb-1">Schedule</p>
          <p className="text-sm text-text-100">{schedule?.name || 'No schedule assigned'}</p>
        </div>

        {/* Display Settings */}
        <div className="mb-4 p-3 bg-bg-100/50 rounded-lg border border-bg-300">
          <p className="text-xs font-semibold text-text-200 uppercase tracking-wide mb-2">Display Settings</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${screen.displaySettings?.showPrices ? 'bg-primary-100' : 'bg-bg-300'}`} />
              <span className="text-text-100">Prices</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${screen.displaySettings?.showIngredients ? 'bg-primary-100' : 'bg-bg-300'}`} />
              <span className="text-text-100">Ingredients</span>
            </div>
            <div className="col-span-2 text-text-100 pt-1 border-t border-bg-300">
              Layout: <span className="font-medium capitalize">{screen.displaySettings?.layoutStyle || 'grid'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <button
            onClick={handlePreview}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() => onDuplicate(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-100 bg-accent-100/10 rounded-lg hover:bg-accent-100/20 transition-all duration-200 border border-transparent hover:border-accent-100"
            title="Duplicate Screen"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(screen)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onDelete(screen)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-200 bg-accent-200/10 rounded-lg hover:bg-accent-200/20 transition-all duration-200 border border-transparent hover:border-accent-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete Screen
        </button>

        {/* Hover indicator */}
        <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-1 w-16 bg-gradient-to-r from-accent-100 to-accent-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ScreenCard;
