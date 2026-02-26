import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import type { Category, TaskStatus, TaskPriority } from '../../types/task';
import './TaskFilter.css';

/* ── Filter option configs ── */
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'pending',     label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed',   label: 'Completed' },
    { value: 'cancelled',   label: 'Cancelled' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high',   label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low',    label: 'Low' },
];

export interface TaskFilters {
    categories: string[];   // category IDs
    statuses:   TaskStatus[];
    priorities: TaskPriority[];
}

interface TaskFilterProps {
    categories: Category[];
    filters: TaskFilters;
    onFiltersChange: (filters: TaskFilters) => void;
}

const EMPTY_FILTERS: TaskFilters = {
    categories: [],
    statuses:   [],
    priorities: [],
};

const TaskFilter: React.FC<TaskFilterProps> = ({ categories, filters, onFiltersChange }) => {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const activeCount =
        filters.categories.length +
        filters.statuses.length +
        filters.priorities.length;

    /* Close panel on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    /* Toggle helpers */
    const toggleCategory = (id: string) => {
        const next = filters.categories.includes(id)
            ? filters.categories.filter(c => c !== id)
            : [...filters.categories, id];
        onFiltersChange({ ...filters, categories: next });
    };

    const toggleStatus = (value: TaskStatus) => {
        const next = filters.statuses.includes(value)
            ? filters.statuses.filter(s => s !== value)
            : [...filters.statuses, value];
        onFiltersChange({ ...filters, statuses: next });
    };

    const togglePriority = (value: TaskPriority) => {
        const next = filters.priorities.includes(value)
            ? filters.priorities.filter(p => p !== value)
            : [...filters.priorities, value];
        onFiltersChange({ ...filters, priorities: next });
    };

    const handleClear = () => {
        onFiltersChange(EMPTY_FILTERS);
    };

    return (
        <div className="tf-wrap" ref={panelRef}>
            {/* Trigger button */}
            <button
                className={`tf-trigger ${activeCount > 0 ? 'tf-trigger--active' : ''}`}
                onClick={() => setOpen(prev => !prev)}
            >
                <Filter size={14} />
                Filter
                {activeCount > 0 && <span className="tf-trigger__count">{activeCount}</span>}
                <ChevronDown size={12} className={`tf-trigger__chevron ${open ? 'tf-trigger__chevron--open' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="tf-panel">
                    <div className="tf-panel__header">
                        <span className="tf-panel__title">Filters</span>
                        {activeCount > 0 && (
                            <button className="tf-panel__clear" onClick={handleClear}>
                                <X size={12} /> Clear all
                            </button>
                        )}
                    </div>

                    {/* ── Category section ── */}
                    <div className="tf-section">
                        <span className="tf-section__label">Category</span>
                        <div className="tf-chips">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`tf-chip ${filters.categories.includes(cat.id) ? 'tf-chip--active' : ''}`}
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            {categories.length === 0 && (
                                <span className="tf-section__empty">No categories</span>
                            )}
                        </div>
                    </div>

                    {/* ── Status section ── */}
                    <div className="tf-section">
                        <span className="tf-section__label">Status</span>
                        <div className="tf-chips">
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`tf-chip tf-chip--status-${opt.value} ${filters.statuses.includes(opt.value) ? 'tf-chip--active' : ''}`}
                                    onClick={() => toggleStatus(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Priority section ── */}
                    <div className="tf-section">
                        <span className="tf-section__label">Priority</span>
                        <div className="tf-chips">
                            {PRIORITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`tf-chip tf-chip--pri-${opt.value} ${filters.priorities.includes(opt.value) ? 'tf-chip--active' : ''}`}
                                    onClick={() => togglePriority(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskFilter;
export { EMPTY_FILTERS };
