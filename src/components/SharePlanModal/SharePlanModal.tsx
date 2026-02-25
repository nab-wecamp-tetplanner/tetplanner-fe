/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Lock, Globe, Loader2 } from 'lucide-react';
import { collaboratorService } from '../../services/collaboratorService';
import './SharePlanModal.css';
import '../AddTaskModal/AddTaskModal.css'

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  configId: string;
  isOwner?: boolean; 
}

const SharePlanModal: React.FC<SharePlanModalProps> = ({ isOpen, onClose, configId, isOwner }) => {
    const [owner, setOwner] = useState<any>(null);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [inviteUserEmail, setInviteUserEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [accessLevel, setAccessLevel] = useState<'restricted' | 'public'>('restricted');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isOpen && configId) fetchCollaborators();
    }, [isOpen, configId]);

    const fetchCollaborators = async () => {
        try {
            const response = await collaboratorService.getCollaborators(configId) as { data: { owner: any; collaborators: any[] } };
            console.log("Fetched collaborators:", response.data);
            setOwner(response.data.owner);
            setCollaborators(response.data.collaborators || []);
        } catch (error) {
            console.error("Error fetching collaborators:", error);
        }
    };

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}/plan/${configId}`;
        navigator.clipboard.writeText(inviteLink)
            .then(() => {
                setIsCopied(true);
                console.log("Invite link copied to clipboard:", inviteLink);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Error copying link: ", err);
                alert("Could not copy link. Please copy manually: " + inviteLink);
            });
    }

    const handleInvite = async () => {
        if (!inviteUserEmail.trim()) {
            alert("Please enter a user email to invite.");
            return;
        }
        setInviteStatus('loading');
        try {
            await collaboratorService.inviteCollaborator({
                tet_config_id: configId,
                user_email: inviteUserEmail,
                role: "editor"
            });
            fetchCollaborators();
            setInviteUserEmail("");
            setInviteStatus('success');
        } catch (error) {
            console.error("Error inviting collaborator:", error);
            console.log("Invite data:", { tet_config_id: configId, user_email: inviteUserEmail, role: "editor" });  
            alert("Error inviting collaborator. Please check the user email and try again.");
            setInviteStatus('idle');
        } finally {
            setTimeout(() => setInviteStatus('idle'), 2000);
        }
    }

    const handleRemoveCollaborator = async (collaboratorId: string) => {
        if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
        try {
            await collaboratorService.removeCollaborator(collaboratorId);
            fetchCollaborators(); 
        } catch (error) {
            console.error("Error removing collaborator:", error);
            alert("Error removing collaborator. Please try again.");
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                
                {/* HEADER */}
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                    <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Share Tet Plan</h3>
                    <button className="close-button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={20} color="#6b7280" />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                    
                    {/* SECTION 1: Invite */}
                    {isOwner && (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
                                Invite Your Loved Ones
                            </h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter email..." 
                                    value={inviteUserEmail}
                                    onChange={(e) => setInviteUserEmail(e.target.value)}
                                    style={{ 
                                        flex: 1, padding: '10px 14px', borderRadius: '8px', 
                                        border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' 
                                    }}
                                />
                                <button 
                                    onClick={handleInvite}
                                    disabled={inviteStatus !== 'idle'}
                                    className={`morph-btn ${inviteStatus}`} // Class CSS quyết định hình dáng
                                >
                                    {inviteStatus === 'idle' && <span>Invite</span>}
                                    
                                    {inviteStatus === 'loading' && <Loader2 className="icon-spin" size={18} />}
                                    
                                    {inviteStatus === 'success' && (
                                        <>
                                            <Check size={18} strokeWidth={3} />
                                            <span>Done!</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: People with access */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
                            People with access
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Owner */}
                            {owner && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                            src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${encodeURIComponent(owner.name || owner.id)}`} 
                                            alt={`Avatar of ${owner.name}`} 
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }} 
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                                                {owner.name}
                                                <span style={{ color: '#6b7280', fontWeight: 400 }}> (You)</span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {owner.email}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Owner</span>
                                </div>
                            )}

                            {/* Collaborators */}
                            {collaborators.map((member) => (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                            src={member.user?.image_url || `https://api.dicebear.com/9.x/toon-head/svg?seed=${encodeURIComponent(member.user?.name || member.id)}`} 
                                            alt={`Avatar of ${member.user?.name || 'User'}`} 
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }} 
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                                                {member.user?.name || member.user_id}
                                                {member.status === 'pending' && (
                                                    <span style={{ 
                                                        marginLeft: '8px', fontSize: '11px', color: '#f59e0b', 
                                                        backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 
                                                    }}>
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {member.user?.email || 'No email'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', color: '#374151', textTransform: 'capitalize' }}>
                                            Editor
                                        </span>
                                        {isOwner && (
                                            <button 
                                                onClick={() => handleRemoveCollaborator(member.id)}
                                                style={{
                                                    backgroundColor: '#dc2626', color: 'white', border: 'none', 
                                                    borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontWeight: 500, fontSize: '12px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: General access (Restricted / Public) */}
                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <h4 style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                            General access
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex' }}>
                                {accessLevel === 'restricted' ? <Lock size={20} color="#4b5563" /> : <Globe size={20} color="#059669" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <select 
                                    value={accessLevel} 
                                    onChange={(e) => setAccessLevel(e.target.value as 'restricted' | 'public')}
                                    style={{ 
                                        border: 'none', fontWeight: 600, fontSize: '14px', color: '#111827', 
                                        padding: 0, cursor: 'pointer', outline: 'none', backgroundColor: 'transparent', marginBottom: '4px' 
                                    }}
                                >
                                    <option value="restricted">Restricted (Only invited people)</option>
                                    <option value="public">Anyone with the link</option>
                                </select>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                                    {accessLevel === 'restricted' 
                                        ? 'Only people added above can open this link.' 
                                        : 'Anyone on the internet with this link can view and edit the plan.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="modal-actions" style={{ padding: '16px 24px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                        onClick={handleCopyLink}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                            borderRadius: '20px', border: '1px solid #d1d5db', backgroundColor: 'white', 
                            cursor: 'pointer', fontWeight: 500, color: isCopied ? '#059669' : '#374151',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                        {isCopied ? 'Link copied!' : 'Copy link'}
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ 
                            backgroundColor: '#dc2626', color: 'white', border: 'none', 
                            borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', fontWeight: 500 
                        }}
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SharePlanModal;