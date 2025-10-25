import { useEffect, useState } from 'react';
import { Clock, Calendar, ChefHat } from 'lucide-react';
import { useData } from '../context/DataContext';
import { getAllCurrentMenuIds, getAllActiveTimeSlots, getCurrentTime, getCurrentDayOfWeek, formatTimeDisplay, formatDaysOfWeek, formatTimeRange } from '../utils/timeUtils';
import MenuItemDisplay from '../components/gallery/MenuItemDisplay';

const CurrentMenuPage = () => {
  const { getSingleSchedule, getMenuById, getItemsByIds } = useData();
  const [currentMenuIds, setCurrentMenuIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDay, setCurrentDay] = useState(getCurrentDayOfWeek());

  const schedule = getSingleSchedule();

  // Update current menus based on time AND day
  useEffect(() => {
    const updateMenus = () => {
      const time = getCurrentTime();
      const day = getCurrentDayOfWeek();
      setCurrentTime(time);
      setCurrentDay(day);

      if (schedule) {
        const menuIds = getAllCurrentMenuIds(schedule, time, day);

        // Fallback to default menu if no active time slots
        if (menuIds.length === 0 && schedule.defaultMenuId) {
          setCurrentMenuIds([schedule.defaultMenuId]);
        } else {
          setCurrentMenuIds(menuIds);
        }
      }
    };

    // Initial update
    updateMenus();

    // Update every minute
    const interval = setInterval(updateMenus, 60000);

    return () => clearInterval(interval);
  }, [schedule]);

  // Get all active time slots
  const activeSlots = schedule ? getAllActiveTimeSlots(schedule, currentTime, currentDay) : [];

  // Check if we're showing the default menu (fallback)
  const isShowingDefaultMenu = activeSlots.length === 0 && currentMenuIds.length > 0 && currentMenuIds[0] === schedule?.defaultMenuId;

  // Get all menus and their items
  const activeMenusWithItems = currentMenuIds.map(menuId => {
    const menu = getMenuById(menuId);
    const items = menu ? getItemsByIds(menu.itemIds).filter(item => item.isActive) : [];
    const slots = activeSlots.filter(slot => slot.menuId === menuId);
    return { menu, items, slots };
  }).filter(({ menu }) => menu !== undefined);

  // Combine all items from all menus
  const allActiveItems = activeMenusWithItems.flatMap(({ items }) => items);

  // Remove duplicates (same item in multiple menus)
  const uniqueItems = Array.from(
    new Map(allActiveItems.map(item => [item.id, item])).values()
  );

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-200">No schedule configured. Please contact administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-200 to-primary-300 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Current Menu</h1>
              <p className="text-bg-100 mt-1">What's being served right now</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{formatTimeDisplay(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5" />
              <span className="font-medium capitalize">{currentDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Menu Info */}
      {activeMenusWithItems.length === 0 || uniqueItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-bg-300">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-bg-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-text-200" />
            </div>
            <h2 className="text-2xl font-bold text-text-100 mb-2">
              No menu available at this time
            </h2>
            <p className="text-text-200">
              There are no active menu items scheduled for {formatTimeDisplay(currentTime)} on {currentDay}.
            </p>
            {schedule.defaultMenuId && (
              <p className="text-sm text-text-200 mt-4">
                Check back during scheduled meal times or view the full schedule.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Multiple Menus Header */}
          {activeMenusWithItems.map(({ menu, items, slots }, menuIndex) => (
            <div key={menu.id} className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-text-100">{menu.title}</h2>
                    {activeMenusWithItems.length > 1 && (
                      <span className="text-xs px-2 py-1 bg-accent-100 text-white rounded font-medium">
                        Menu {menuIndex + 1} of {activeMenusWithItems.length}
                      </span>
                    )}
                    {isShowingDefaultMenu && (
                      <span className="text-xs px-2 py-1 bg-accent-100 text-white rounded font-medium">
                        Default Menu
                      </span>
                    )}
                  </div>
                  <p className="text-text-200">{menu.description}</p>
                </div>

                {!isShowingDefaultMenu && slots.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-text-200">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
                        </div>
                        {slot.daysOfWeek && slot.daysOfWeek.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-primary-100 text-white rounded self-start">
                            {formatDaysOfWeek(slot.daysOfWeek)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {isShowingDefaultMenu ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-100/20 border border-accent-200 rounded-lg">
                    <div className="w-2 h-2 bg-accent-200 rounded-full" />
                    <span className="text-sm font-medium text-accent-200">Available (No Active Time Slot)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100/20 border border-primary-200 rounded-lg">
                    <div className="w-2 h-2 bg-primary-100 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-primary-100">Now Serving</span>
                  </div>
                )}
                <span className="text-sm text-text-200">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in this menu
                </span>
              </div>
            </div>
          ))}

          {/* Combined Items Summary (if multiple menus) */}
          {activeMenusWithItems.length > 1 && (
            <div className="bg-white rounded-xl shadow-md p-4 border border-bg-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-100">
                    Combined Menu Items
                  </h3>
                  <p className="text-sm text-text-200 mt-1">
                    Showing all items from {activeMenusWithItems.length} active menus
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-100">{uniqueItems.length}</p>
                  <p className="text-xs text-text-200">total items</p>
                </div>
              </div>
            </div>
          )}

          {/* All Menu Items Grid */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-bg-300">
            <h3 className="text-lg font-semibold text-text-100 mb-4">
              {activeMenusWithItems.length > 1 ? 'All Available Items' : 'Available Items'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uniqueItems.map(item => (
                <MenuItemDisplay
                  key={item.id}
                  item={item}
                  showPrices={true}
                  showIngredients={true}
                  layoutStyle="grid"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentMenuPage;
