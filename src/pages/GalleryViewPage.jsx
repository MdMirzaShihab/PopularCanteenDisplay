import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import GalleryDisplay from '../components/gallery/GalleryDisplay';

const GalleryViewPage = () => {
  const { screenId } = useParams();
  const { getScreenById } = useData();

  const screen = getScreenById(screenId);

  if (!screen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Screen Not Found</h1>
          <p className="text-xl text-gray-400">
            The requested screen does not exist.
          </p>
        </div>
      </div>
    );
  }

  return <GalleryDisplay screen={screen} />;
};

export default GalleryViewPage;
