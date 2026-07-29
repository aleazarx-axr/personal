// src/components/PortalLayout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Folder,
  Shield,
  ChevronDown,
  Zap,
  Globe,
  GraduationCap,
  Calculator
} from "lucide-react";

interface PortalLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  pageTitle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Notification States
  const [pendingDocsCount, setPendingDocsCount] = useState(0);
  const [pendingMemosCount, setPendingMemosCount] = useState(0);

  // Accordion State
  const [activeMenu, setActiveMenu] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  const userString = localStorage.getItem("portalUser");
  const user = userString
    ? JSON.parse(userString)
    : { firstName: "User", role: "Guest" };

  const executeLogout = () => {
    localStorage.removeItem("portalUser");
    navigate("/login");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const toggleAccordion = (menu: string) => {
    if (isDesktopCollapsed) setIsDesktopCollapsed(false);
    setActiveMenu(activeMenu === menu ? "" : menu);
  };

  // --- SMART ACCORDION ROUTING (UPDATED CATEGORIES) ---
  useEffect(() => {
    const path = location.pathname;
    if (["/memoranda", "/document-tracking"].includes(path)) {
      setActiveMenu("docs");
    } else if (
      ["/news-manager", "/calendar-manager", "/officials-manager"].includes(
        path
      )
    ) {
      setActiveMenu("portal");
    } else if (
      [
        "/classroom-monitoring",
        "/teaching-loads",
        "/master-scheduler",
      ].includes(path)
    ) {
      setActiveMenu("academic");
    } else if (["/admin", "/logs", "/settings"].includes(path)) {
      setActiveMenu("admin");
    } else {
      setActiveMenu("");
    }
  }, [location.pathname]);

  // --- REAL-TIME NOTIFICATION POLLING ---
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const docResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/document-tracking`
        );
        if (docResponse.ok) {
          const docData = await docResponse.json();
          setPendingDocsCount(
            docData.filter((doc: any) => doc.status === "Pending").length
          );
        }

        const memoResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/memoranda`
        );
        if (memoResponse.ok) {
          const memoData = await memoResponse.json();
          setPendingMemosCount(
            memoData.filter((memo: any) => memo.status === "Pending").length
          );
        }
      } catch (error) {
        console.error("Failed to fetch notification counts");
      }
    };

    if (user.role !== "Student") {
      fetchPendingCounts();
      const intervalId = setInterval(fetchPendingCounts, 10000);
      return () => clearInterval(intervalId);
    }
  }, [user.role]);

  const isActive = (path: string) => location.pathname === path;
  const hasDocNotifications = pendingDocsCount > 0 || pendingMemosCount > 0;

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-800 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        ${
          isMobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0"
        }
        ${isDesktopCollapsed ? "md:w-[72px]" : "md:w-64"}`}
      >
        {/* Branding Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center overflow-hidden w-full px-5">
            <img
              src="/wmsu-logo.png"
              alt="WMSU Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <h1
              className={`text-base font-bold text-gray-900 tracking-wide ml-3 transition-opacity duration-200 whitespace-nowrap ${
                isDesktopCollapsed
                  ? "md:opacity-0 md:w-0 md:ml-0"
                  : "opacity-100"
              }`}
            >
              MyWMSU
            </h1>
          </div>
          <button
            onClick={closeMenu}
            className="md:hidden text-gray-400 hover:text-gray-700 absolute right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-3 gap-1">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className={`flex items-center px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
              isActive("/dashboard")
                ? "bg-red-50 text-[#9B1C1C]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                isDesktopCollapsed ? "mx-auto" : "mr-3"
              } ${isActive("/dashboard") ? "text-[#9B1C1C]" : "opacity-70"}`}
            />
            {!isDesktopCollapsed && <span>System Dashboard</span>}
          </Link>

          <div className="my-2 border-t border-gray-100 mx-2"></div>

          {/* ================= CATEGORY 1: DOCUMENT MANAGEMENT ================= */}
          <div>
            <button
              onClick={() => toggleAccordion("docs")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                activeMenu === "docs" && !isDesktopCollapsed
                  ? "bg-gray-50 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center relative">
                <Folder
                  className={`w-4 h-4 shrink-0 ${
                    isDesktopCollapsed ? "mx-auto" : "mr-3"
                  } ${
                    activeMenu === "docs"
                      ? "text-[#9B1C1C] opacity-100"
                      : "opacity-70"
                  }`}
                />
                {!isDesktopCollapsed && <span>Official Records</span>}
                {isDesktopCollapsed && hasDocNotifications && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#9B1C1C] rounded-full border border-white"></span>
                )}
              </div>
              {!isDesktopCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-50 transition-transform ${
                    activeMenu === "docs" ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                activeMenu === "docs" && !isDesktopCollapsed
                  ? "max-h-[300px] opacity-100 mt-1"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-1 pl-9 pr-2">
                <Link
                  to="/memoranda"
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/memoranda")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>Issuances & Memos</span>
                  {pendingMemosCount > 0 && (
                    <span className="bg-[#9B1C1C] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {pendingMemosCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/document-tracking"
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/document-tracking")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>Document Logs</span>
                  {pendingDocsCount > 0 && (
                    <span className="bg-[#9B1C1C] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {pendingDocsCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* ================= CATEGORY 2: PORTAL MANAGEMENT ================= */}
          <div className="mt-1">
            <button
              onClick={() => toggleAccordion("portal")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                activeMenu === "portal" && !isDesktopCollapsed
                  ? "bg-gray-50 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center relative">
                <Globe
                  className={`w-4 h-4 shrink-0 ${
                    isDesktopCollapsed ? "mx-auto" : "mr-3"
                  } ${
                    activeMenu === "portal"
                      ? "text-[#9B1C1C] opacity-100"
                      : "opacity-70"
                  }`}
                />
                {!isDesktopCollapsed && <span>Communications</span>}
              </div>
              {!isDesktopCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-50 transition-transform ${
                    activeMenu === "portal" ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                activeMenu === "portal" && !isDesktopCollapsed
                  ? "max-h-[300px] opacity-100 mt-1"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-1 pl-9 pr-2">
                <Link
                  to="/news-manager"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/news-manager")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Manage News
                </Link>
                <Link
                  to="/calendar-manager"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/calendar-manager")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Manage Calendar
                </Link>
                <Link
                  to="/officials-manager"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/officials-manager")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Manage Officials
                </Link>
              </div>
            </div>
          </div>

          {/* ================= CATEGORY 3: ACADEMIC OPERATIONS ================= */}
          <div className="mt-1">
            <button
              onClick={() => toggleAccordion("academic")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                activeMenu === "academic" && !isDesktopCollapsed
                  ? "bg-gray-50 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center relative">
                <GraduationCap
                  className={`w-4 h-4 shrink-0 ${
                    isDesktopCollapsed ? "mx-auto" : "mr-3"
                  } ${
                    activeMenu === "academic"
                      ? "text-[#9B1C1C] opacity-100"
                      : "opacity-70"
                  }`}
                />
                {!isDesktopCollapsed && <span>Curriculum & Monitoring</span>}
              </div>
              {!isDesktopCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-50 transition-transform ${
                    activeMenu === "academic" ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                activeMenu === "academic" && !isDesktopCollapsed
                  ? "max-h-[300px] opacity-100 mt-1"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-1 pl-9 pr-2">
                <Link
                  to="/classroom-monitoring"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/classroom-monitoring")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Classroom Monitoring
                </Link>
                <Link
                  to="/teaching-loads"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/teaching-loads")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Teaching Loads
                </Link>
                <Link
                  to="/assessment"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive("/assessment")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Assessment of Fees
                </Link>
                <div className="my-1 border-t border-gray-100"></div>
                <Link
                  to="/master-scheduler"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                    isActive("/master-scheduler")
                      ? "bg-red-50 text-[#9B1C1C]"
                      : "text-[#9B1C1C] hover:bg-red-50"
                  }`}
                >
                  {" "}
                  Schedule Generator
                </Link>
              </div>
            </div>
          </div>

          <div className="my-2 border-t border-gray-100 mx-2"></div>

          {/* ================= CATEGORY 4: ADMINISTRATION ================= */}
          {user.role === "Superuser" && (
            <div className="mt-1">
              <button
                onClick={() => toggleAccordion("admin")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  activeMenu === "admin" && !isDesktopCollapsed
                    ? "bg-gray-50 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <Shield
                    className={`w-4 h-4 shrink-0 ${
                      isDesktopCollapsed ? "mx-auto" : "mr-3"
                    } ${
                      activeMenu === "admin"
                        ? "text-[#9B1C1C] opacity-100"
                        : "opacity-70"
                    }`}
                  />
                  {!isDesktopCollapsed && <span>Administration</span>}
                </div>
                {!isDesktopCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-50 transition-transform ${
                      activeMenu === "admin" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeMenu === "admin" && !isDesktopCollapsed
                    ? "max-h-60 opacity-100 mt-1"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-1 pl-9 pr-2">
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive("/admin")
                        ? "bg-red-50 text-[#9B1C1C]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Accounts
                  </Link>
                  <Link
                    to="/logs"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive("/logs")
                        ? "bg-red-50 text-[#9B1C1C]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    System Logs
                  </Link>
                  <Link
                    to="/settings"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive("/settings")
                        ? "bg-red-50 text-[#9B1C1C]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer: User Profile */}
        <div className="border-t border-gray-100 bg-white flex flex-col shrink-0 overflow-hidden">
          <div
            className={`p-4 transition-all duration-300 ${
              isDesktopCollapsed ? "md:hidden" : "block"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-red-50 text-[#9B1C1C] flex items-center justify-center font-bold text-xs border border-red-100 shrink-0">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-center py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-xs font-bold hover:bg-red-50 hover:text-[#9B1C1C] hover:border-red-100 transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
            </button>
          </div>

          <div
            className={`py-4 transition-all duration-300 ${
              isDesktopCollapsed ? "md:block hidden" : "hidden"
            }`}
          >
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex justify-center text-gray-400 hover:text-[#9B1C1C] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen relative w-full overflow-hidden bg-gray-50/50">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 md:hidden text-gray-500 hover:text-gray-900 focus:outline-none transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-gray-800 truncate">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-6 text-sm hidden sm:flex">
            {/* Global Notification Bell */}
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors">
              <Bell className="w-4 h-4" />
              {hasDocNotifications && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9B1C1C]"></span>
                </span>
              )}
            </button>

            <div className="h-5 w-px bg-gray-200"></div>

            <span className="flex items-center text-green-700 font-bold uppercase tracking-widest text-[10px]">
              <span className="w-2 h-2 bg-green-500 mr-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              System Active
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </div>
      </main>

      {/* --- PROPER LOGOUT MODAL --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-sm w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <LogOut className="w-6 h-6 text-[#9B1C1C]" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-[#9B1C1C] hover:bg-[#7a1515] rounded-lg shadow-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
