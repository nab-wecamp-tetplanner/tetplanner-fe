import React from 'react'
import { NavLink } from "react-router-dom";
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import { ZodiacMascot } from '../Decoratives/Decoratives';

import './Header.css';

type NavItem = {
  name: string;
  href: string;
};
const navItems : NavItem[] = [
    { name: "Overview", href: "/" },
    { name: "Task management", href: "/task" },
    { name: "Calendar", href: "/calendar" },
    { name: "Finance", href: "/finance" },
    { name: "Transactions", href: "/transaction" },
    { name: "Dashboard", href: "/dashboard" },
];


const Header = () => {
  return (

    <header className='header-container'>
        <div className="header-logo">
            <ZodiacMascot size={28} className="header-mascot" />
            <span className="logo-text">Tet Planner</span>
        </div>
    
        <nav className="header-nav">
            {navItems.map((item) => (
            <NavLink key={item.href} to={item.href} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                {item.name}
            </NavLink>
            ))}
        </nav>

        <div className="header-actions">
            <ThemeSelector />
            <div className="header-actions__divider" />
            <button className="action-button">⚙️</button>
            <div className="notification-wrapper">
                <button className="action-button">🔔</button>
                <span className="notification-dot"></span>
            </div>
            <div className="user-avatar">
                <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                    alt="User avatar" 
                />
            </div>
        </div>
    </header>
  )
}

export default Header
