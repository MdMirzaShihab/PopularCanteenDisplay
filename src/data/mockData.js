// Mock Data for Canteen Management Demo
// All data stored here will be used as initial data and persisted to localStorage

import { foodImages } from '../assets';

// Generate unique ID helper
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial Users
export const initialUsers = [
  {
    id: 'user-admin-001',
    name: 'Admin User',
    email: 'admin@canteen.com',
    username: 'admin',
    password: 'admin123', // In demo, any password works
    role: 'admin',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'user-restaurant-001',
    name: 'Restaurant Manager',
    email: 'manager@canteen.com',
    username: 'manager',
    password: 'manager123',
    role: 'restaurant_user',
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'user-operator-001',
    name: 'Token Operator',
    email: 'operator@canteen.com',
    username: 'operator',
    password: 'operator123',
    role: 'token_operator',
    createdAt: '2024-01-15T09:00:00Z'
  }
];

// Initial Food Items with placeholder images
// NOTE: Replace placeholder images with actual images in /src/assets/items/
// Image naming convention: {item-name-lowercase}.jpg (e.g., chicken-biryani.jpg, khichuri.jpg)
export const initialItems = [
  {
    id: 'item-001',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken, spices, and herbs',
    price: 180.00,
    ingredients: 'basmati rice, chicken, onions, yogurt, biryani masala, saffron, ghee',
    image: foodImages.chickenBiryani,
    isActive: true,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  },
  {
    id: 'item-002',
    name: 'Kacchi Biryani',
    description: 'Traditional Dhaka-style mutton biryani with fragrant rice and succulent meat',
    price: 250.00,
    ingredients: 'basmati rice, mutton, yogurt, potatoes, fried onions, kewra water, spices',
    image: foodImages.kacchiBiryani,
    isActive: true,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 'item-003',
    name: 'Bhuna Khichuri',
    description: 'Traditional Bengali rice and lentil dish, perfectly spiced and comforting',
    price: 100.00,
    ingredients: 'rice, moong dal, onions, ginger, turmeric, cumin, ghee',
    image: foodImages.bhunaKhichuri,
    isActive: true,
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-01-20T09:30:00Z'
  },
  {
    id: 'item-004',
    name: 'Chicken Curry with Rice',
    description: 'Home-style chicken curry served with steamed white rice',
    price: 120.00,
    ingredients: 'chicken, onions, tomatoes, garlic, ginger, curry spices, steamed rice',
    image: foodImages.chickenCurry,
    isActive: true,
    createdAt: '2024-01-20T09:45:00Z',
    updatedAt: '2024-01-20T09:45:00Z'
  },
  {
    id: 'item-005',
    name: 'Beef Curry with Rice',
    description: 'Slow-cooked tender beef curry with aromatic spices and steamed rice',
    price: 140.00,
    ingredients: 'beef, onions, tomatoes, ginger-garlic paste, garam masala, steamed rice',
    image: foodImages.beefCurry,
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'item-006',
    name: 'Chinese Noodles',
    description: 'Stir-fried noodles with vegetables and your choice of chicken or egg',
    price: 90.00,
    ingredients: 'noodles, cabbage, carrots, capsicum, soy sauce, chicken/egg, spring onions',
    image: foodImages.chineseNoodles,
    isActive: true,
    createdAt: '2024-01-20T10:15:00Z',
    updatedAt: '2024-01-20T10:15:00Z'
  },
  {
    id: 'item-007',
    name: 'Chicken Fried Rice',
    description: 'Flavorful fried rice with chicken pieces, vegetables, and soy sauce',
    price: 95.00,
    ingredients: 'rice, chicken, eggs, carrots, peas, soy sauce, spring onions',
    image: foodImages.chickenFriedRice,
    isActive: true,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'item-008',
    name: 'Pasta',
    description: 'Creamy pasta with vegetables and special white sauce',
    price: 110.00,
    ingredients: 'pasta, cream, garlic, vegetables, cheese, herbs, white sauce',
    image: foodImages.pasta,
    isActive: true,
    createdAt: '2024-01-20T10:45:00Z',
    updatedAt: '2024-01-20T10:45:00Z'
  },
  {
    id: 'item-009',
    name: 'Fried Chicken',
    description: 'Crispy golden fried chicken pieces, perfectly seasoned',
    price: 130.00,
    ingredients: 'chicken, flour, eggs, breadcrumbs, spices, garlic powder',
    image: foodImages.friedChicken,
    isActive: true,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  },
  {
    id: 'item-010',
    name: 'Singara',
    description: 'Crispy triangular pastry filled with spiced potatoes and vegetables',
    price: 15.00,
    ingredients: 'flour, potatoes, peas, onions, cumin, coriander, chili',
    image: foodImages.singara,
    isActive: true,
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  {
    id: 'item-011',
    name: 'Samucha',
    description: 'Crispy fried snack filled with savory mixed vegetables',
    price: 15.00,
    ingredients: 'flour, cabbage, carrots, onions, vermicelli, spices',
    image: foodImages.samucha,
    isActive: true,
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  },
  {
    id: 'item-012',
    name: 'Cha (Tea)',
    description: 'Traditional Bangladeshi milk tea with perfect blend of spices',
    price: 12.00,
    ingredients: 'tea leaves, milk, sugar, cardamom, ginger',
    image: foodImages.cha,
    isActive: true,
    createdAt: '2024-01-20T11:45:00Z',
    updatedAt: '2024-01-20T11:45:00Z'
  },
  {
    id: 'item-013',
    name: 'Cold Coffee',
    description: 'Refreshing iced coffee with milk and sugar',
    price: 60.00,
    ingredients: 'coffee, milk, sugar, ice, vanilla essence',
    image: foodImages.coldCoffee,
    isActive: true,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z'
  },
  {
    id: 'item-014',
    name: 'Borhani',
    description: 'Traditional yogurt-based drink with mint and spices, perfect with biryani',
    price: 30.00,
    ingredients: 'yogurt, mint leaves, green chili, mustard, black salt, cumin',
    image: foodImages.borhani,
    isActive: true,
    createdAt: '2024-01-20T12:15:00Z',
    updatedAt: '2024-01-20T12:15:00Z'
  },
  {
    id: 'item-015',
    name: 'Firni',
    description: 'Creamy rice pudding dessert with cardamom and nuts',
    price: 50.00,
    ingredients: 'rice flour, milk, sugar, cardamom, almonds, pistachios',
    image: foodImages.firni,
    isActive: true,
    createdAt: '2024-01-20T12:30:00Z',
    updatedAt: '2024-01-20T12:30:00Z'
  }
];

// Initial Menus
export const initialMenus = [
  {
    id: 'menu-001',
    title: 'Breakfast Menu',
    description: 'Start your day with our delicious breakfast options',
    itemIds: ['item-001', 'item-006', 'item-007', 'item-010'],
    createdAt: '2024-01-21T08:00:00Z',
    updatedAt: '2024-01-21T08:00:00Z'
  },
  {
    id: 'menu-002',
    title: 'Lunch Menu',
    description: 'Satisfying lunch options for your midday meal',
    itemIds: ['item-002', 'item-003', 'item-004', 'item-008'],
    createdAt: '2024-01-21T08:15:00Z',
    updatedAt: '2024-01-21T08:15:00Z'
  },
  {
    id: 'menu-003',
    title: 'Dinner Menu',
    description: 'End your day with our premium dinner selections',
    itemIds: ['item-004', 'item-005', 'item-003', 'item-009'],
    createdAt: '2024-01-21T08:30:00Z',
    updatedAt: '2024-01-21T08:30:00Z'
  }
];

// Initial Schedules
export const initialSchedules = [
  {
    id: 'schedule-001',
    defaultMenuId: 'menu-001',
    timeSlots: [
      {
        id: 'slot-001',
        startTime: '07:00',
        endTime: '11:00',
        menuId: 'menu-001',
        menuName: 'Breakfast Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] // Mon-Fri
      },
      {
        id: 'slot-002',
        startTime: '12:00',
        endTime: '16:00',
        menuId: 'menu-002',
        menuName: 'Lunch Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'slot-003',
        startTime: '18:00',
        endTime: '22:00',
        menuId: 'menu-003',
        menuName: 'Dinner Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'slot-004',
        startTime: '09:00',
        endTime: '15:00',
        menuId: 'menu-001',
        menuName: 'Breakfast Menu',
        daysOfWeek: ['saturday', 'sunday'] // Weekend brunch
      },
      {
        id: 'slot-005',
        startTime: '17:00',
        endTime: '21:00',
        menuId: 'menu-003',
        menuName: 'Dinner Menu',
        daysOfWeek: ['saturday', 'sunday']
      }
    ],
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z'
  }
];

// Initial Screens
export const initialScreens = [
  {
    id: 'screen-001',
    title: 'Main Dining Hall Display',
    defaultMenuId: 'menu-001',
    timeSlots: [
      {
        id: 'screen-slot-001',
        startTime: '07:00',
        endTime: '11:00',
        menuId: 'menu-001',
        menuName: 'Breakfast Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'screen-slot-002',
        startTime: '12:00',
        endTime: '16:00',
        menuId: 'menu-002',
        menuName: 'Lunch Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        id: 'screen-slot-003',
        startTime: '18:00',
        endTime: '22:00',
        menuId: 'menu-003',
        menuName: 'Dinner Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    ],
    backgroundType: 'image',
    backgroundMedia: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234361ee;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%233a0ca3;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="1920" height="1080"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%23fff" opacity="0.3"%3EMain Dining Hall%3C/text%3E%3C/svg%3E',
    displaySettings: {
      layoutStyle: 'grid',
      showPrices: true,
      showIngredients: true,
      transitionDuration: 500
    },
    createdAt: '2024-01-23T08:00:00Z',
    updatedAt: '2024-01-23T08:00:00Z'
  },
  {
    id: 'screen-002',
    title: 'Cafeteria Display',
    defaultMenuId: 'menu-002',
    timeSlots: [
      {
        id: 'screen-slot-004',
        startTime: '11:00',
        endTime: '14:00',
        menuId: 'menu-002',
        menuName: 'Lunch Menu',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    ],
    backgroundType: 'image',
    backgroundMedia: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2306b6d4;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230891b2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad2)" width="1920" height="1080"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%23fff" opacity="0.3"%3ECafeteria%3C/text%3E%3C/svg%3E',
    displaySettings: {
      layoutStyle: 'list',
      showPrices: true,
      showIngredients: false,
      transitionDuration: 300
    },
    createdAt: '2024-01-23T08:30:00Z',
    updatedAt: '2024-01-23T08:30:00Z'
  }
];

// Initial Activity Logs
export const initialActivityLogs = [
  {
    id: 'log-001',
    timestamp: '2024-01-23T09:00:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'screen',
    resourceName: 'Main Dining Hall Display',
    details: 'Created new screen with daily schedule',
    beforeData: null,
    afterData: { title: 'Main Dining Hall Display', scheduleId: 'schedule-001' }
  },
  {
    id: 'log-002',
    timestamp: '2024-01-23T09:15:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'screen',
    resourceName: 'Cafeteria Display',
    details: 'Created new screen for cafeteria',
    beforeData: null,
    afterData: { title: 'Cafeteria Display', scheduleId: 'schedule-001' }
  },
  {
    id: 'log-003',
    timestamp: '2024-01-22T10:30:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'UPDATE',
    resourceType: 'item',
    resourceName: 'Classic Burger',
    details: 'Updated burger price',
    beforeData: { price: 11.99 },
    afterData: { price: 12.99 }
  },
  {
    id: 'log-004',
    timestamp: '2024-01-22T11:00:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'schedule',
    resourceName: 'Daily Restaurant Schedule',
    details: 'Created new daily schedule with 3 time slots',
    beforeData: null,
    afterData: { name: 'Daily Restaurant Schedule', slotsCount: 3 }
  },
  {
    id: 'log-005',
    timestamp: '2024-01-21T14:20:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'menu',
    resourceName: 'Dinner Menu',
    details: 'Created dinner menu with 4 items',
    beforeData: null,
    afterData: { title: 'Dinner Menu', itemsCount: 4 }
  },
  {
    id: 'log-006',
    timestamp: '2024-01-21T14:00:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'menu',
    resourceName: 'Lunch Menu',
    details: 'Created lunch menu with 4 items',
    beforeData: null,
    afterData: { title: 'Lunch Menu', itemsCount: 4 }
  },
  {
    id: 'log-007',
    timestamp: '2024-01-21T13:40:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'menu',
    resourceName: 'Breakfast Menu',
    details: 'Created breakfast menu with 4 items',
    beforeData: null,
    afterData: { title: 'Breakfast Menu', itemsCount: 4 }
  },
  {
    id: 'log-008',
    timestamp: '2024-01-20T11:15:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Fresh Orange Juice',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Fresh Orange Juice', price: 4.99 }
  },
  {
    id: 'log-009',
    timestamp: '2024-01-20T11:00:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Chocolate Brownie',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Chocolate Brownie', price: 6.99 }
  },
  {
    id: 'log-010',
    timestamp: '2024-01-20T10:45:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Grilled Chicken Sandwich',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Grilled Chicken Sandwich', price: 11.99 }
  },
  {
    id: 'log-011',
    timestamp: '2024-01-20T10:30:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'French Toast',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'French Toast', price: 7.99 }
  },
  {
    id: 'log-012',
    timestamp: '2024-01-20T10:15:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Fresh Coffee',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Fresh Coffee', price: 3.99 }
  },
  {
    id: 'log-013',
    timestamp: '2024-01-20T10:00:00Z',
    userId: 'user-restaurant-001',
    userName: 'Restaurant Manager',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Spaghetti Carbonara',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Spaghetti Carbonara', price: 13.99 }
  },
  {
    id: 'log-014',
    timestamp: '2024-01-20T09:45:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'item',
    resourceName: 'Margherita Pizza',
    details: 'Added new item to menu',
    beforeData: null,
    afterData: { name: 'Margherita Pizza', price: 14.99 }
  },
  {
    id: 'log-015',
    timestamp: '2024-01-15T08:30:00Z',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'CREATE',
    resourceType: 'user',
    resourceName: 'Restaurant Manager',
    details: 'Created new restaurant manager account',
    beforeData: null,
    afterData: { username: 'manager', role: 'restaurant_user' }
  }
];

export { generateId };
