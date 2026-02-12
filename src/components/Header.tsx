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
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-600 rounded-sm transform rotate-45"></div>
        <span className="font-bold text-gray-900 text-lg">NY Planner</span>
      </div>
      <nav className="flex items-center gap-8 text-sm font-medium text-gray-500">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
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
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-gray-900">⚙️</button>
        <div className="relative">
          <button className="hover:text-gray-900">🔔</button>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        <img
          src="https://ui-avatars.com/api/?name=NY&background=3B82F6&color=fff"
          alt="User"
          className="w-8 h-8 rounded-full border border-gray-200"
        />
      </div>
    </header>
  );
};
