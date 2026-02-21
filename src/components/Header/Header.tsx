import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Overview", href: "/" },
  { name: "Task management", href: "/task" },
  { name: "Calendar", href: "/calendar" },
  { name: "Finance", href: "/finance" },
  { name: "Transactions", href: "/transaction" },
  { name: "Dashboard", href: "/dashboard" },
];

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthContext();

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-600 rounded-sm transform rotate-45"></div>
        <span className="font-bold text-gray-900 text-lg">NY Planner</span>
      </Link>

      {/* Navigation - Chỉ hiển thị khi đã đăng nhập */}
      {isAuthenticated && (
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-500">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "bg-blue-50 text-blue-600 p-2 rounded-md"
                  : "text-gray-500 p-2 rounded-md hover:text-gray-900"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Auth Actions & Profile */}
      <div className="flex items-center gap-4 text-gray-500 text-sm">
        {isAuthenticated ? (
          <>
            <button className="hover:text-gray-900">⚙️</button>
            <div className="relative">
              <button className="hover:text-gray-900">🔔</button>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-400">{currentUser?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;