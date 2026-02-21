import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import ThemeSelector from "./ThemeSelector/ThemeSelector";

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
    <header className="flex items-center justify-between px-8 py-4 bg-bg-main border-b border-accent transition-colors duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-6 h-6 bg-primary rounded-sm transform rotate-45 transition-all duration-300 group-hover:rotate-90"></div>
        <span className="font-bold text-text-main text-lg transition-colors duration-300">NY Planner</span>
      </Link>

      {/* Navigation isAuthenticated */}
      {isAuthenticated && (
        <nav className="flex items-center gap-1 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-md" // Thay bg-accent bằng bg-primary và ép text-white
                    : "text-text-main opacity-70 hover:opacity-100 hover:bg-accent/20"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Auth Actions & Profile */}
      <div className="flex items-center gap-4">
        <ThemeSelector />

        {isAuthenticated ? (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
            <div className="relative cursor-pointer">
              <button className="text-xl hover:scale-110 transition-transform">🔔</button>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-main"></span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-main leading-none">{currentUser?.name}</p>
                <p className="text-[10px] text-text-main opacity-50 uppercase tracking-tighter mt-1">Member</p>
              </div>
              <button 
                onClick={logout}
                // Ép text-white ở đây để Logout không bị mất chữ
                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 ml-2 pl-4 border-l border-accent transition-colors duration-300">
            <Link to="/login" className="text-text-main/70 hover:text-primary font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:opacity-90 transition-all shadow-md">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;