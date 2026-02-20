import { NavLink } from "react-router-dom";

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

export const Header = () => {
  return (
    <header className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-primary-foreground">T</span>
          </div>
          <span className="font-bold text-foreground text-lg">
            Tết Planner Pro
          </span>
        </div>
        <nav className="flex items-center gap-2 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-md transition-all"
                  : "text-muted-foreground px-4 py-2 rounded-xl hover:text-foreground hover:bg-muted transition-all"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-muted-foreground">
          <button className="hover:text-foreground transition-colors">
            ⚙️
          </button>
          <div className="relative">
            <button className="hover:text-foreground transition-colors">
              🔔
            </button>
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
          </div>
          <img
            src="https://ui-avatars.com/api/?name=TT&background=3B82F6&color=fff"
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};
