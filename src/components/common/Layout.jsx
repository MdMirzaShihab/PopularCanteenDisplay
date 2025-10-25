import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from './Toast';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-bg-100 overflow-hidden">
      {/* Toast Notifications */}
      <Toast />

      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex h-[calc(100vh-57px)] mt-[57px]">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 lg:ml-64">
          <div className="max-w-[1920px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
