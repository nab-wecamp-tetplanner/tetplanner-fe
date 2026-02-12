import React from 'react'
import { NavLink } from "react-router-dom";

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
            <div className="logo-icon"></div>
            <span className="logo-text">NY Planner</span>
        </div>
    
        <nav className="header-nav">
            {navItems.map((item) => (
            <NavLink key={item.href} to={item.href} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                {item.name}
            </NavLink>
            ))}
        </nav>

        <div className="header-actions">
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
