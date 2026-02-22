/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { X, Copy, Check, Lock, Globe } from 'lucide-react';
import { MOCK_MEMBERS } from '../../data/mockTasks'; 
import './SharePlanModal.css';
import '../AddTaskModal/AddTaskModal.css'

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  configId: string;
}

const SharePlanModal: React.FC<SharePlanModalProps> = ({ isOpen, onClose, configId }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [accessLevel, setAccessLevel] = useState<'restricted' | 'public'>('restricted');
    const [inviteEmail, setInviteEmail] = useState('');

    if(!isOpen) return null;

    const shareLink = `${window.location.origin}/plan/${configId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }
    return (
        // Dùng chung class với AddTaskModal để đồng bộ UI
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                
                {/* HEADER */}
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                    <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Chia sẻ Kế hoạch Tết</h3>
                    <button className="close-button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={20} color="#6b7280" />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                    
                    {/* KHU VỰC 1: Form mời thêm người */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                        <input 
                            type="email" 
                            placeholder="Nhập email người thân..." 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={{ 
                                flex: 1, padding: '10px 14px', borderRadius: '8px', 
                                border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' 
                            }}
                        />
                        <button style={{
                            backgroundColor: '#dc2626', color: 'white', border: 'none', 
                            borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: 500
                        }}>
                            Mời
                        </button>
                    </div>

                    {/* KHU VỰC 2: Danh sách người đã có quyền truy cập */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
                            Người có quyền truy cập
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {MOCK_MEMBERS.map((member, index) => (
                                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img 
                                            src={member.avatar} 
                                            alt={member.name} 
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }} 
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                                                {member.name} {index === 0 && <span style={{ color: '#6b7280', fontWeight: 400 }}>(Bạn)</span>}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {/* Giả lập email từ ID */}
                                                {member.id.replace('user-', '')}@family.com
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '13px', color: index === 0 ? '#6b7280' : '#374151' }}>
                                        {index === 0 ? 'Chủ sở hữu' : 'Người chỉnh sửa'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KHU VỰC 3: Quyền truy cập chung (Restricted / Public) */}
                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <h4 style={{ fontSize: '13px', color: '#4b5563', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                            Quyền truy cập chung
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex' }}>
                                {accessLevel === 'restricted' ? <Lock size={20} color="#4b5563" /> : <Globe size={20} color="#059669" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <select 
                                    value={accessLevel} 
                                    onChange={(e) => setAccessLevel(e.target.value as any)}
                                    style={{ 
                                        border: 'none', fontWeight: 600, fontSize: '14px', color: '#111827', 
                                        padding: 0, cursor: 'pointer', outline: 'none', backgroundColor: 'transparent', marginBottom: '4px' 
                                    }}
                                >
                                    <option value="restricted">Hạn chế (Chỉ người được mời)</option>
                                    <option value="public">Bất kỳ ai có liên kết</option>
                                </select>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                                    {accessLevel === 'restricted' 
                                        ? 'Chỉ những người được thêm ở trên mới có thể mở liên kết này.' 
                                        : 'Bất kỳ ai trên internet có liên kết này đều có thể xem và chỉnh sửa kế hoạch.'}
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
                        {isCopied ? 'Đã sao chép link' : 'Sao chép liên kết'}
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ 
                            backgroundColor: '#dc2626', color: 'white', border: 'none', 
                            borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', fontWeight: 500 
                        }}
                    >
                        Xong
                    </button>
                </div>

            </div>
        </div>
    );
};


export default SharePlanModal;