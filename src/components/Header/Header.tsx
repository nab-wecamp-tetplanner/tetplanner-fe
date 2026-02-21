import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import ThemeSelector from "../ThemeSelector/ThemeSelector";

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
      <Link to="/" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded-sm transform rotate-45 transition-colors duration-300"></div>
        <span className="font-bold text-text-main text-lg transition-colors duration-300">NY Planner</span>
      </Link>

      {/* Navigation isAuthenticated*/}
      {isAuthenticated && (
        <nav className="flex items-center gap-8 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "bg-accent text-primary p-2 rounded-md transition-all duration-300"
                  : "text-text-main opacity-70 p-2 rounded-md hover:opacity-100 hover:text-primary transition-all duration-300"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Auth Actions & Profile */}
      <div className="flex items-center gap-4 text-sm">
        
        {/*THEME SELECTOR*/}
        <ThemeSelector />

        {isAuthenticated ? (
          <>
            <button className="text-text-main hover:text-primary transition-colors">⚙️</button>
            <div className="relative">
              <button className="text-text-main hover:text-primary transition-colors">🔔</button>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-main transition-colors duration-300"></span>
            </div>
            
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-main">{currentUser?.name}</p>
                <p className="text-xs text-text-main opacity-60">{currentUser?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="bg-accent hover:bg-primary text-text-main hover:text-bg-main px-3 py-1.5 rounded-md transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
            <Link 
              to="/login" 
              className="text-text-main hover:text-primary font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-primary text-bg-main px-4 py-2 rounded-md hover:opacity-90 transition-all duration-300"
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