import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Settings, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthTypes";
import ThemeSelector from "../ThemeSelector/ThemeSelector";

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Overview", href: "/" },
  { name: "Tasks", href: "/task" },
  { name: "Calendar", href: "/calendar" },
  { name: "Finance", href: "/finance" },
  { name: "Transactions", href: "/transaction" },
  { name: "Dashboard", href: "/dashboard" },
];

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg-main border-b border-accent backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg transform rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
            <span className="font-bold text-text-main text-xl hidden sm:block">NY Planner</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-main/70 hover:text-text-main hover:bg-accent/50"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-text-main/70 hover:text-text-main hover:bg-accent rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Theme Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowThemeMenu(!showThemeMenu);
                      setShowProfileMenu(false);
                    }}
                    className="p-2 text-text-main/70 hover:text-text-main hover:bg-accent rounded-lg transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {showThemeMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowThemeMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-bg-main border border-accent rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="p-2">
                          <p className="text-xs font-medium text-text-main/50 px-2 mb-2">Theme</p>
                          <ThemeSelector />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowThemeMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-all"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-text-main">{currentUser?.name}</p>
                      <p className="text-xs text-text-main/50">View profile</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-main/50 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-bg-main border border-accent rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="p-2 border-b border-accent">
                          <p className="text-sm font-medium text-text-main px-2">{currentUser?.name}</p>
                          <p className="text-xs text-text-main/50 px-2">{currentUser?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-accent rounded-md transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            Edit Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-accent rounded-md transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>
                        <div className="p-1 border-t border-accent">
                          <button
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-main hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;