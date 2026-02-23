import { NavLink, useNavigate } from "react-router-dom";
import { Settings, Bell } from "lucide-react";
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import { ZodiacMascot } from '../Decoratives/Decoratives';

import './Header.css';
import { useEffect, useRef, useState } from "react";
import { collaboratorService } from "../../services/collaboratorService";

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


type Invitation = { id: string; role: string; tet_config_id: string };

type InvitationResponse = {
    data: Invitation[];
};

const Header = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const response = await collaboratorService.getMyInvitations() as InvitationResponse;
                setInvitations(response.data);
            } catch (error) {
                console.error("Failed to fetch invitations", error);
            }
        };
        fetchInvitations();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAccept = async (invitation: Invitation) => {
        try {
            await collaboratorService.acceptInvitation(invitation.id);
            setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
            setIsNotifOpen(false);
            // Navigate to task management with the accepted config
            navigate(`/task?config=${invitation.tet_config_id}`);
        } catch (error) {
            console.error("Failed to accept invitation", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log("Error details:", (error as any).response ? (error as any).response.data : error);
        }
    };

    const handleDecline = async (id: string) => {
        if (!window.confirm("Bạn muốn từ chối lời mời này?")) return;
        try {
            await collaboratorService.declineInvitation(id);
            setInvitations(prev => prev.filter(inv => inv.id !== id));
            setIsNotifOpen(false);
        } catch (error) {
            console.error("Failed to decline invitation", error);
        }
    };

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
            <button className="action-button"><Settings size={18} /></button>
            <div className="notification-wrapper">
                <button className="action-button" onClick={() => setIsNotifOpen(!isNotifOpen)}><Bell size={18} /></button>
                {invitations.length > 0 && (
                    <span className="notification-dot" style={{
                    position: 'absolute', top: 0, right: 0, backgroundColor: 'red', 
                    color: 'white', fontSize: '10px', width: '16px', height: '16px', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    {invitations.length}
                    </span>
                )}
                {/* DROPDOWN DANH SÁCH LỜI MỜI */}
                {isNotifOpen && (
                    <div style={{
                    position: 'absolute', top: '45px', right: '-10px', width: '320px', 
                    backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                    borderRadius: '12px', border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden'
                    }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151' }}>
                        Thông báo của bạn
                    </div>
                    
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {invitations.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            Bạn không có thông báo nào.
                        </div>
                        ) : (
                        invitations.map(inv => (
                            <div key={inv.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fffbeb' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>
                                Someone invites you to be an <strong>{inv.role}</strong> for a Tet plan!
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                onClick={() => {
                                    handleAccept(inv);
                                }}
                                style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                                >
                                I do!
                                </button>
                                <button 
                                onClick={() => handleDecline(inv.id)}
                                style={{ flex: 1, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                                >
                                No, thanks
                                </button>
                            </div>
                            </div>
                        ))
                        )}
                    </div>
                    </div>
                )}
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
