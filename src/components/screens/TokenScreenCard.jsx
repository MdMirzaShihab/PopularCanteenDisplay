import { Edit2, Trash2, ExternalLink, Hash, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const TokenScreenCard = ({ screen, onEdit, onDelete }) => {
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
      {/* Token Icon Header */}
      <div className="relative h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
          <Hash className="w-16 h-16 text-yellow-400 relative" />
        </div>
        <div className="absolute top-2 left-2">
          <div className="bg-yellow-500 text-gray-900 px-3 py-1.5 rounded-lg shadow-lg">
            <span className="text-xs font-bold">Token</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-text-100 mb-2 group-hover:text-primary-100 transition-colors line-clamp-1">
          {screen.title}
        </h3>
        <p className="text-sm text-text-200 mb-4">
          ID: <span className="font-mono">{screen.screenId}</span>
        </p>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handlePreview}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={handleCopyUrl}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Copy Display URL">
            <Link2 className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(screen)}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
            title="Edit">
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

export default TokenScreenCard;
