/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { X, Calendar as CalIcon, Plus } from 'lucide-react';
import './ManagePhasesModal.css';
import { type ManagePhasesModalProps } from '../../types/task';
import { todoService } from '../../services/todoService';

const ManagePhasesModal: React.FC<ManagePhasesModalProps> = ({ isOpen, onClose, phases, configId, onPhaseCreated }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !startDate || !endDate) {
            alert("Please fill in all fields (name and dates)!");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name: name.trim(),
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                display_order: phases.length + 1,
                tet_config_id: configId
            };

            // Call API (createTimelinePhase in todoService)
            const res = await todoService.createTimelinePhase(payload);
            
            onPhaseCreated((res as { data: any }).data); // Return data to parent component
            
            // Reset form
            setName(''); setStartDate(''); setEndDate('');
        } catch (error) {
            console.error(error);
            alert("Error creating timeline phase!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Manage Tet Schedule</h3>
                    <button className="close-button" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                    
                    {/* List of existing phases */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#4b5563' }}>Current timeline phases</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {phases.length === 0 && <span style={{ color: '#9ca3af', fontSize: '13px' }}>No phases yet. Create one!</span>}
                            {phases.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</span>
                                    {p.start_date && (
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {new Date(p.start_date).toLocaleDateString('en-US')}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr style={{ margin: '20px 0', borderTop: '1px solid #e5e7eb' }} />

                    {/* Create new phase form */}
                    <form onSubmit={handleCreate}>
                        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={16} /> Create new phase
                        </h4>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Phase name (e.g. New Year's Eve)</label>
                            <input 
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                placeholder="Enter phase name..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Start date</label>
                                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>End date</label>
                                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isLoading ? 'wait' : 'pointer' }}
                        >
                            {isLoading ? 'Creating...' : 'Save timeline phase'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManagePhasesModal;