import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import ThemeSelector from "../ThemeSelector/ThemeSelector";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
import { useLoading } from "../../contexts/LoadingContext";

type NavItem = {
  name: string;
  href: string;
};

export interface ConfigInfo extends TetConfig {
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  warning_level: string;
  categories: string[];
}
const navItems: NavItem[] = [
  { name: "Overview", href: "/" },
  { name: "Task management", href: "/task" },
  { name: "Calendar", href: "/calendar" },
  { name: "Finance", href: "/finance" },
  { name: "Transactions", href: "/transaction" },
  { name: "Dashboard", href: "/dashboard" },
];

// const Header = () => {
//   const { isAuthenticated, currentUser, logout } = useAuthContext();

//   return (
//     <header className="flex items-center justify-between px-8 py-4 bg-bg-main border-b border-accent transition-colors duration-300">
//       {/* Logo */}
//       <Link to="/" className="flex items-center gap-2">
//         <div className="w-6 h-6 bg-primary rounded-sm transform rotate-45 transition-colors duration-300"></div>
//         <span className="font-bold text-text-main text-lg transition-colors duration-300">NY Planner</span>
//       </Link>

//       {/* Navigation isAuthenticated*/}
//       {isAuthenticated && (
//         <nav className="flex items-center gap-8 text-sm font-medium">
//           {navItems.map((item, idx) => (
//             <NavLink
//               key={idx}
//               to={item.href}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-accent text-primary p-2 rounded-md transition-all duration-300"
//                   : "text-text-main opacity-70 p-2 rounded-md hover:opacity-100 hover:text-primary transition-all duration-300"
//               }
//             >
//               {item.name}
//             </NavLink>
//           ))}
//         </nav>
//       )}

//       {/* Auth Actions & Profile */}
//       <div className="flex items-center gap-4 text-sm">

//         {/*THEME SELECTOR*/}
//         <ThemeSelector />

//         {isAuthenticated ? (
//           <>
//             <button className="text-text-main hover:text-primary transition-colors">⚙️</button>
//             <div className="relative">
//               <button className="text-text-main hover:text-primary transition-colors">🔔</button>
//               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-main transition-colors duration-300"></span>
//             </div>

//             <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm font-semibold text-text-main">{currentUser?.name}</p>
//                 <p className="text-xs text-text-main opacity-60">{currentUser?.email}</p>
//               </div>
//               <button
//                 onClick={logout}
//                 className="bg-accent hover:bg-primary text-text-main hover:text-bg-main px-3 py-1.5 rounded-md transition-all duration-300"
//               >
//                 Logout
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
//             <Link
//               to="/login"
//               className="text-text-main hover:text-primary font-medium transition-colors"
//             >
//               Login
//             </Link>
//             <Link
//               to="/register"
//               className="bg-primary text-bg-main px-4 py-2 rounded-md hover:opacity-90 transition-all duration-300"
//             >
//               Register
//             </Link>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthContext();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [activeConfig, setActiveConfig] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        showLoading();

        const response: TetConfig[] = await apiClient.tetConfigs.getMyConfigs();
        
        const configWithBudgets = await Promise.all(
          response.map(async (config) => {
            const budget = await apiClient.tetConfigs.getBudgetSummary(config.id);
            return { ...config, ...budget };
          })
        );

        setConfigs(configWithBudgets);
      } catch (error) {
        console.error("Error fetching configs with budgets:", error);
      } finally {
        hideLoading(); 
      }
    };
    
    fetchConfigs();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-bg-main border-b border-accent transition-colors duration-300 relative">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded-sm transform rotate-45 transition-colors duration-300"></div>
        <span className="font-bold text-text-main text-lg transition-colors duration-300">
          NY Planner
        </span>
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

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* User Info & Settings */}
            <div
              className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300 relative"
              ref={settingsRef}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text-main">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-text-main opacity-60">
                  {currentUser?.email}
                </p>
              </div>

              {/* Settings */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className={`p-2 rounded-lg transition-all ${showSettings ? "bg-primary text-white" : "bg-accent hover:bg-primary/20 text-text-main"}`}
              >
                ⚙️
              </button>

              {/* Menu Dropdown */}
              {showSettings && (
                <div className="bg-white absolute right-0 top-full mt-2 w-64 bg-bg-card border border-accent rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4">
                  {/* Section 1: CONFIG (PLAN) */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest px-1">
                      Config
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {configs.map((cfg) => (
                        <button
                          key={cfg.id}
                          onClick={() => setActiveConfig(cfg.id)}
                          className={`flex items-center gap-3 p-2 rounded-lg text-[12px] transition-all ${activeConfig === cfg.id ? "bg-primary/10 border border-primary/30 text-primary" : "hover:bg-accent text-text-main"}`}
                        >
                          <span className="flex-1 text-left font-medium">
                            {cfg.name}
                          </span>
                          {activeConfig === cfg.id && (
                            <span className="text-[10px]">●</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-accent my-1"></div>

                  {/* PHẦN 2: CHỌN THEME */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest px-1">
                      Chủ đề giao diện
                    </p>
                    <ThemeSelector />
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-text-main hover:text-primary font-medium"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
export default Header;
