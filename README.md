# Canteen Management Software - Demo Version

A complete, fully-functional demo of a Canteen Management System built with React, Vite, and Tailwind CSS. This is a client demonstration version that works entirely with static data stored in localStorage.

## Features

### Core Functionality
- **Items Management**: Create, edit, and manage food/beverage items with images, prices, and ingredients
- **Menu Management**: Organize items into themed menus (Breakfast, Lunch, Dinner, etc.)
- **Schedule Management**: Configure time-based schedules to automatically display menus at specific times
- **Screen Management**: Set up multiple display screens with custom backgrounds and display settings
- **Gallery Display**: Full-screen 16:9 displays that automatically show the correct menu based on time
- **Activity Logs**: Track all system changes and activities (Admin only)

### Technical Features
- **Authentication**: Login system with admin and restaurant user roles
- **Data Persistence**: All data stored in localStorage (survives page refresh)
- **File Upload**: Image/video upload with base64 conversion for demo purposes
- **Time-Based Logic**: Automatic menu switching based on schedule
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Real-time Updates**: Auto-refresh gallery displays every minute

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173 to view the application.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Demo Accounts

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Access**: Full access including Activity Logs

### Restaurant Manager Account
- **Username**: manager
- **Password**: manager123
- **Access**: All features except Activity Logs

**Note**: This is a demo - any credentials will work for login, but the above accounts have pre-configured data.

## Project Structure

```
src/
├── components/
│   ├── common/         # Reusable components (Layout, Modal, Toast, etc.)
│   ├── items/          # Item management components
│   ├── menus/          # Menu management components
│   ├── schedules/      # Schedule management with timeline
│   ├── screens/        # Screen configuration components
│   ├── gallery/        # Full-screen display components
│   └── logs/           # Activity logging components
├── context/
│   ├── AuthContext.jsx         # Authentication state
│   ├── DataContext.jsx         # Data management & CRUD
│   └── NotificationContext.jsx # Toast notifications
├── data/
│   └── mockData.js     # Initial demo data
├── pages/              # Page components
├── utils/              # Utility functions
├── App.jsx             # Routing configuration
└── main.jsx            # App entry point
```

## Usage Guide

### Creating a Complete Setup

1. **Add Items** → Go to Items page → Click "Add New Item" → Fill details and upload image → Save
2. **Create Menus** → Go to Menus page → Click "Create Menu" → Select items → Save
3. **Set Up Schedule** → Go to Schedules → Add time slots → Assign menus → Save
4. **Configure Screen** → Go to Screens → Upload background → Select schedule → Save
5. **View Gallery** → Go to Gallery → Click screen card → Opens full-screen display

## Testing the Demo

### Quick Test
1. Login as **admin** (username: admin, password: admin123)
2. Navigate through all pages to see pre-loaded demo data
3. Create a new item with an image
4. View Activity Logs to see your action recorded
5. Open Gallery to see full-screen displays

### Time-Based Display Test
1. Note the current time
2. Check schedules to see which menu should be active
3. Open a gallery display
4. Verify the correct menu is showing

## Key Features

### Gallery Display (Showcase Feature)
- Automatically switches menus based on time
- Updates every 60 seconds
- Full-screen 16:9 aspect ratio
- Perfect for restaurant displays
- Press F11 for true full-screen

### Schedule Timeline
- Visual 24-hour timeline
- Color-coded time slots
- Overlap detection
- Drag-free time selection

### Activity Logging
- Tracks all CRUD operations
- Before/after data snapshots
- Filterable by user, type, action, date
- Admin-only access

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Application won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Data disappeared
- Data stored in browser localStorage
- Clear localStorage to reset to mock data
- Refresh page to reload

## Built With

React 18 + Vite + Tailwind CSS + React Router + Lucide Icons + date-fns
