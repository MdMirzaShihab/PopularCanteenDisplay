// Media Gallery Assets
// Pre-bundled images and videos for section content (avoids localStorage bloat)

import foodBgFruits from './food-bg-fruits.png';
import foodBgSpices from './food-bg-spices.png';
import indianFoodBowls from './indian-food-bowls.png';
import freshVegetables from './fresh-vegetables.png';
import grilledCarrots from './grilled-carrots.mp4';
import friedChickenDrizzle from './fried-chicken-drizzle.mp4';
import coffeeAnimation from './coffee-animation.mp4';
import cheeseburger from './cheeseburger.mp4';
import fallingLemons from './falling-lemons.mp4';
import orangeJuiceSplash from './orange-juice-splash.mp4';
import fallingStrawberries from './falling-strawberries.mp4';

export const mediaGallery = [
  { id: 'img-food-fruits', name: 'Food & Fruits', type: 'image', src: foodBgFruits },
  { id: 'img-food-spices', name: 'Food & Spices', type: 'image', src: foodBgSpices },
  { id: 'img-indian-bowls', name: 'Indian Food Bowls', type: 'image', src: indianFoodBowls },
  { id: 'img-fresh-veggies', name: 'Fresh Vegetables', type: 'image', src: freshVegetables },
  { id: 'vid-grilled-carrots', name: 'Grilled Carrots', type: 'video', src: grilledCarrots },
  { id: 'vid-fried-chicken', name: 'Fried Chicken', type: 'video', src: friedChickenDrizzle },
  { id: 'vid-coffee', name: 'Coffee Animation', type: 'video', src: coffeeAnimation },
  { id: 'vid-cheeseburger', name: 'Cheeseburger', type: 'video', src: cheeseburger },
  { id: 'vid-lemons', name: 'Falling Lemons', type: 'video', src: fallingLemons },
  { id: 'vid-orange-juice', name: 'Orange Juice Splash', type: 'video', src: orangeJuiceSplash },
  { id: 'vid-strawberries', name: 'Falling Strawberries', type: 'video', src: fallingStrawberries },
];

export const getMediaByType = (type) => mediaGallery.filter(m => m.type === type);
export const getAllMedia = () => mediaGallery;
export const getMediaById = (id) => mediaGallery.find(m => m.id === id);
