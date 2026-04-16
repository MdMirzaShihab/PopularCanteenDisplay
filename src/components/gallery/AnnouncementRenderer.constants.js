import {
  Megaphone,
  Bell,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Star,
  Heart,
} from 'lucide-react';

export const ANNOUNCEMENT_ICONS = {
  Megaphone,
  Bell,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Star,
  Heart,
};

export const ANNOUNCEMENT_ICON_OPTIONS = [
  { id: null, label: 'None' },
  { id: 'Megaphone', label: 'Megaphone' },
  { id: 'Bell', label: 'Bell' },
  { id: 'AlertCircle', label: 'Alert' },
  { id: 'Info', label: 'Info' },
  { id: 'Calendar', label: 'Calendar' },
  { id: 'Clock', label: 'Clock' },
  { id: 'PartyPopper', label: 'Celebration' },
  { id: 'Sparkles', label: 'Sparkle' },
  { id: 'UtensilsCrossed', label: 'Dining' },
  { id: 'Coffee', label: 'Coffee' },
  { id: 'Star', label: 'Star' },
  { id: 'Heart', label: 'Heart' },
];

export const ANNOUNCEMENT_PRESETS = [
  {
    id: 'poster',
    label: 'Poster',
    description: 'Bold cinema-lobby hero',
    defaults: {
      textFont: 'font-heading',
      textColor: '#ffffff',
      backgroundColor: '#1a1a2e',
      textAlign: 'center',
    },
  },
  {
    id: 'notice',
    label: 'Notice',
    description: 'Elegant bulletin with accent',
    defaults: {
      textFont: 'font-display',
      textColor: '#ffffff',
      backgroundColor: '#7c5c1a',
      textAlign: 'left',
    },
  },
  {
    id: 'chalkboard',
    label: 'Chalkboard',
    description: 'Warm hand-written feel',
    defaults: {
      textFont: 'font-marker',
      textColor: '#f5d778',
      backgroundColor: '#2d4a3e',
      textAlign: 'center',
    },
  },
  {
    id: 'banner',
    label: 'Banner',
    description: 'High-contrast strip',
    defaults: {
      textFont: 'font-heading',
      textColor: '#ffffff',
      backgroundColor: '#c0392b',
      textAlign: 'center',
    },
  },
];
