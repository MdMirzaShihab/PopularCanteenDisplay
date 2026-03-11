import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { isVideoUrl } from '../../utils/fileUtils';
import { DEFAULT_SLIDE_DURATION, DEFAULT_TRANSITION } from '../../utils/mediaUtils';

const MediaSlideshow = memo(function MediaSlideshow({
  mediaItems = [],
  slideDuration = DEFAULT_SLIDE_DURATION,
  transition = DEFAULT_TRANSITION
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Phase: 'idle' -> 'entering' (next mounted at start position) -> 'animating' (transition running) -> 'idle'
  const [phase, setPhase] = useState('idle');
  const timerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const rafRef = useRef(null);
  const prevItemsRef = useRef(mediaItems);
  const itemsLengthRef = useRef(mediaItems.length);

  itemsLengthRef.current = mediaItems.length;

  // Reset when mediaItems change
  useEffect(() => {
    if (prevItemsRef.current !== mediaItems) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setCurrentIndex(0);
      setPhase('idle');
      prevItemsRef.current = mediaItems;
    }
  }, [mediaItems]);

  const nextIndex = (mediaItems.length > 0)
    ? (currentIndex + 1) % mediaItems.length
    : 0;

  const getTransitionDuration = useCallback(() => {
    if (transition === 'fadeBlack') return 600;
    if (transition === 'cut') return 0;
    return 500;
  }, [transition]);

  const advanceSlide = useCallback(() => {
    if (itemsLengthRef.current <= 1) return;

    if (transition === 'cut') {
      setCurrentIndex(prev => (prev + 1) % itemsLengthRef.current);
      return;
    }

    // Phase 1: mount next layer at its start position
    setPhase('entering');

    // Phase 2: after paint, trigger the animation
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setPhase('animating');

        const duration = transition === 'fadeBlack' ? 600 : 500;
        transitionTimerRef.current = setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % itemsLengthRef.current);
          setPhase('idle');
        }, duration);
      });
    });
  }, [transition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Timer for image slides
  useEffect(() => {
    if (mediaItems.length <= 1) return;
    if (phase !== 'idle') return;

    const currentSrc = mediaItems[currentIndex];
    if (!currentSrc) return;

    // Videos advance via onEnded, not timer
    if (isVideoUrl(currentSrc)) return;

    timerRef.current = setTimeout(() => {
      advanceSlide();
    }, slideDuration * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, mediaItems, slideDuration, phase, advanceSlide]);

  const handleVideoEnded = useCallback(() => {
    if (itemsLengthRef.current > 1) {
      advanceSlide();
    }
  }, [advanceSlide]);

  const handleVideoError = useCallback(() => {
    if (itemsLengthRef.current > 1) {
      advanceSlide();
    }
  }, [advanceSlide]);

  if (mediaItems.length === 0) return null;

  // Single video: simple loop
  if (mediaItems.length === 1 && isVideoUrl(mediaItems[0])) {
    return (
      <video
        src={mediaItems[0]}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-xl"
      />
    );
  }

  // Single image: static display
  if (mediaItems.length === 1) {
    return (
      <img
        src={mediaItems[0]}
        alt=""
        className="w-full h-full object-cover rounded-xl"
      />
    );
  }

  // Multiple items: slideshow with transitions
  const currentSrc = mediaItems[currentIndex];
  const nextSrc = mediaItems[nextIndex];
  const isAnimating = phase === 'animating';
  const showNextLayer = phase === 'entering' || phase === 'animating';
  const dur = getTransitionDuration();
  const transitionProp = `${dur}ms ease-in-out`;

  const getCurrentLayerStyles = () => {
    if (!isAnimating) return {};

    switch (transition) {
      case 'crossfade':
        return { opacity: 0, transition: `opacity ${transitionProp}` };
      case 'slide':
        return { transform: 'translateX(-100%)', transition: `transform ${transitionProp}` };
      case 'fadeBlack':
        return { opacity: 0, transition: `opacity ${transitionProp}` };
      case 'zoom':
        return {
          opacity: 0,
          transform: 'scale(1.1)',
          transition: `opacity ${transitionProp}, transform ${transitionProp}`
        };
      default:
        return {};
    }
  };

  // Returns the START position for the next layer (before animation begins)
  const getNextLayerStartStyles = () => {
    switch (transition) {
      case 'crossfade':
        return { opacity: 0 };
      case 'slide':
        return { transform: 'translateX(100%)' };
      case 'fadeBlack':
        return { opacity: 0 };
      case 'zoom':
        return { opacity: 0, transform: 'scale(0.9)' };
      default:
        return { opacity: 0 };
    }
  };

  // Returns the END position for the next layer (when animation runs)
  const getNextLayerAnimateStyles = () => {
    switch (transition) {
      case 'crossfade':
        return { opacity: 1, transition: `opacity ${transitionProp}` };
      case 'slide':
        return { transform: 'translateX(0)', transition: `transform ${transitionProp}` };
      case 'fadeBlack':
        return { opacity: 1, transition: `opacity ${transitionProp}` };
      case 'zoom':
        return {
          opacity: 1,
          transform: 'scale(1)',
          transition: `opacity ${transitionProp}, transform ${transitionProp}`
        };
      default:
        return { opacity: 1 };
    }
  };

  const getNextLayerStyles = () => {
    if (phase === 'entering') return getNextLayerStartStyles();
    if (phase === 'animating') return getNextLayerAnimateStyles();
    return { opacity: 0 };
  };

  const renderMediaItem = (src, isActive) => {
    if (isVideoUrl(src)) {
      return (
        <video
          src={src}
          autoPlay
          muted
          playsInline
          onEnded={isActive ? handleVideoEnded : undefined}
          onError={isActive ? handleVideoError : undefined}
          className="w-full h-full object-cover"
        />
      );
    }
    return <img src={src} alt="" className="w-full h-full object-cover" />;
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl"
      style={transition === 'fadeBlack' ? { backgroundColor: '#000' } : undefined}
    >
      {/* Current layer */}
      <div className="absolute inset-0" style={getCurrentLayerStyles()}>
        {renderMediaItem(currentSrc, phase === 'idle')}
      </div>

      {/* Next layer - mounted during entering & animating phases */}
      {showNextLayer && (
        <div className="absolute inset-0" style={getNextLayerStyles()}>
          {renderMediaItem(nextSrc, false)}
        </div>
      )}
    </div>
  );
});

export default MediaSlideshow;
