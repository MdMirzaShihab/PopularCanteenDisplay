import { Link } from 'react-router-dom';
import { ExternalLink, Monitor } from 'lucide-react';
import { useData } from '../context/DataContext';

const GalleryPage = () => {
  const { screens, getMenuById } = useData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-100">Gallery Displays</h1>
        <p className="text-text-200 mt-1">Preview and access full-screen displays</p>
      </div>

      {/* Screens Grid */}
      {screens.length === 0 ? (
        <div className="bg-bg-200/60 backdrop-blur-3xl rounded-2xl shadow-md p-12 text-center border border-bg-300">
          <div className="w-20 h-20 bg-bg-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-10 h-10 text-text-200" />
          </div>
          <h3 className="text-lg font-medium text-text-100 mb-2">No Screens Available</h3>
          <p className="text-text-200 mb-4">
            Create a screen first to view it in gallery mode.
          </p>
          <Link
            to="/screens"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-white font-medium rounded-lg hover:bg-primary-200 transition-colors"
          >
            Go to Screens
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => {
            const defaultMenu = getMenuById(screen.defaultMenuId);
            return (
              <Link
                key={screen.id}
                to={`/gallery/${screen.id}`}
                className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-bg-300 hover:border-accent-100"
              >
                {/* Preview */}
                <div className="relative h-48 bg-gradient-to-br from-primary-300 to-primary-200 overflow-hidden">
                  {screen.backgroundMedia && (
                    <img
                      src={screen.backgroundMedia}
                      alt={screen.title}
                      className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
                    />
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <ExternalLink className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                  </div>

                  {/* Click Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-br from-accent-100 to-accent-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                      <span className="text-xs font-bold">Click to View</span>
                    </div>
                  </div>

                  {/* Monitor Icon Badge */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                      <Monitor className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-primary-100 transition-colors line-clamp-1">{screen.title}</h3>

                  <div className="space-y-2 text-sm border-t border-bg-300 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-200">Time Slots:</span>
                      <span className="font-medium text-text-100 px-2 py-0.5 bg-primary-100/10 rounded">
                        {screen.timeSlots?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-200">Default Menu:</span>
                      <span className="font-medium text-text-100 text-right line-clamp-1 flex-1 ml-2">
                        {defaultMenu?.title || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-200">Layout:</span>
                      <span className="font-medium text-text-100 capitalize px-2 py-0.5 bg-accent-100/10 rounded">
                        {screen.displaySettings?.layoutStyle || 'grid'}
                      </span>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-1 w-16 bg-gradient-to-r from-accent-100 to-accent-200 rounded-full"></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-bg-200/60 backdrop-blur-3xl border border-bg-300 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-primary-100 mb-3">
          How to Use Gallery Displays
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-100">
          <li>Click on any screen card to open it in fullscreen display mode</li>
          <li>The display will automatically enter fullscreen and show edge-to-edge content</li>
          <li>The menu automatically shows the correct items based on the current time</li>
          <li>The menu updates every minute according to the schedule</li>
          <li>Press ESC key to exit fullscreen mode and return to the gallery</li>
          <li>Perfect for restaurant monitors or TV displays</li>
        </ul>
      </div>
    </div>
  );
};

export default GalleryPage;
