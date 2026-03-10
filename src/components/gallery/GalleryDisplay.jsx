import ScreenGridRenderer from './ScreenGridRenderer';

const GalleryDisplay = ({ screen }) => {
  return (
    <div className="fixed inset-0 overflow-auto">
      <ScreenGridRenderer screen={screen} />
    </div>
  );
};

export default GalleryDisplay;
