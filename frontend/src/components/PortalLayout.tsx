// src/components/PortalLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  FileText, 
  CheckSquare, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'; 

interface PortalLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children, pageTitle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ADDED: To track current URL
  
  const userString = localStorage.getItem('portalUser');
  const user = userString ? JSON.parse(userString) : { firstName: 'User', role: 'Guest' };

  const handleLogout = () => {
    localStorage.removeItem('portalUser');
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar - Responsive (Sliding on mobile, static on desktop) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-300 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-300 bg-white">
          <div className="flex items-center">
            <img src="/wmsu-logo.png" alt="WMSU Logo" className="w-8 h-8 mr-3 object-contain" />
            <h1 className="text-lg font-bold text-gray-900 tracking-wider">MyWMSU Ipil</h1>
          </div>
          {/* Close button for mobile */}
          <button onClick={closeMenu} className="md:hidden text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <div className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">
            Administration
          </div>
          <Link 
            to="/admin" 
            onClick={closeMenu} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/admin' 
                ? 'bg-gray-200 text-[#9B1C1C] border-[#9B1C1C]' 
                : 'text-gray-600 border-transparent hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 mr-3" />
            User Management
          </Link>
          <Link 
            to="/logs" 
            onClick={closeMenu} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/logs' 
                ? 'bg-gray-200 text-[#9B1C1C] border-[#9B1C1C]' 
                : 'text-gray-600 border-transparent hover:bg-gray-100'
            }`}
          >
            <Activity className="w-4 h-4 mr-3" />
            Activity Logs
          </Link>
          
          <div className="px-6 py-2 mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            Documents
          </div>
          <Link 
            to="/dashboard" 
            onClick={closeMenu} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/dashboard' 
                ? 'bg-gray-200 text-[#9B1C1C] border-[#9B1C1C]' 
                : 'text-gray-600 border-transparent hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Link>
          <Link 
            to="/memoranda" 
            onClick={closeMenu} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/memoranda' 
                ? 'bg-gray-200 text-[#9B1C1C] border-[#9B1C1C]' 
                : 'text-gray-600 border-transparent hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 mr-3" />
            Memoranda
          </Link>
          <Link 
            to="/document-tracking" 
            onClick={closeMenu} 
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/document-tracking' 
                ? 'bg-gray-200 text-[#9B1C1C] border-[#9B1C1C]' 
                : 'text-gray-600 border-transparent hover:bg-gray-100'
            }`}
          >
            <CheckSquare className="w-4 h-4 mr-3" />
            Document Approvals
          </Link>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-300 bg-gray-100">
          <div className="text-sm font-bold text-gray-800">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gray-500 mb-3">{user.role}</div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 rounded-none transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-300 bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">{pageTitle}</h2>
          </div>
          
          {/* AWS Style Breadcrumb/Status */}
          <div className="flex items-center space-x-4 text-sm hidden sm:flex">
            <span className="flex items-center text-green-700 font-medium">
              <span className="w-2 h-2 bg-green-500 mr-2 rounded-full"></span> System Active
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white">
          {children}
        </div>
      </main>
    </div>
  );
};