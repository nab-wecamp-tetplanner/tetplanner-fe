/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { X, Plus,  Calendar } from "lucide-react";
import "./ManagePhasesModal.css";
import { type ManagePhasesModalProps } from "../../types/task.types";
import { useToast } from "../../hooks/useToast";
import type { TimelineCreateRequest } from "../../types/timeline.types";
import { useAppStore } from "../../stores/useAppStore";
import apiClient from "../../services/apiClient";

const ManagePhasesModal: React.FC<ManagePhasesModalProps> = ({
  isOpen,
  onClose,
  phases = [],
  onPhaseCreated,
}) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const configId = useAppStore((state) => state.configId);
  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      toast.warning("Please fill in all fields (name and dates)!");
      return;
    }
    if (!configId) return;
 
    try {
         setIsLoading(true);
      const payload : TimelineCreateRequest = {
        name: name.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        // 2. SAFE CHECK FOR LENGTH
        display_order: (phases?.length || 0) + 1,
        tet_config_id: configId,
      };

      const savedPhase = await apiClient.timelinePhases.create(payload);
      // const newPhase = (res as { data: any }).data;
      onPhaseCreated(savedPhase);

      setName("");
      setStartDate("");
      setEndDate("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error creating timeline phase!");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // 3. ENSURE PHASES IS AN ARRAY BEFORE RENDERING
  const safePhases = Array.isArray(phases) ? phases : [];

  return (
    <div className="mpm-overlay" onClick={onClose}>
      <div className="mpm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Shimmer bar */}
        <div className="mpm-shimmer" />

        {/* Header */}
        <div className="mpm-header">
          <div className="mpm-header__left">
            <Calendar size={18} />
            <h3 className="mpm-header__title">Add new phases</h3>
          </div>
          <button className="mpm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Phase list */}
        <div className="mpm-section">
          <h4 className="mpm-section__label">Timeline Phases</h4>
          <div className="mpm-phase-list">
            {/* 4. SAFE RENDERING LOGIC */}
            {safePhases.length === 0 ? (
              <p className="mpm-empty">No phases yet. Create one below!</p>
            ) : (
              safePhases.map((p) => {
                // const isActive = p.id === activePhaseId;
                return (
                  <div
                    key={p.id}
                    className={`mpm-phase `}
                    onClick={() => {
                      // onSelectPhase(p.id);
                      onClose();
                    }}
                  >
                    <div className="mpm-phase__info">
                      <span className="mpm-phase__name">{p.name}</span>
                      {p.start_date && (
                        <span className="mpm-phase__date">
                          {formatDate(p.start_date)}
                          {p.end_date && ` — ${formatDate(p.end_date)}`}
                        </span>
                      )}
                    </div>
                    {/* {isActive && (
                      <div className="mpm-phase__check">
                        <Check size={16} />
                      </div>
                    )} */}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mpm-divider" />

        {/* Create form */}
        <form className="mpm-form" onSubmit={handleCreate}>
          <h4 className="mpm-form__title">
            <Plus size={16} /> Create New Phase
          </h4>

          <div className="mpm-field">
            <label className="mpm-label">Phase name</label>
            <input
              className="mpm-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Year's Eve"
            />
          </div>

          <div className="mpm-row">
            <div className="mpm-field">
              <label className="mpm-label">Start date</label>
              <input
                className="mpm-input"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="mpm-field">
              <label className="mpm-label">End date</label>
              <input
                className="mpm-input"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button className="mpm-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Creating…" : "Save Phase"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagePhasesModal;