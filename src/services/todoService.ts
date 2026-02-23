/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiClient';

export const todoService = {
    getTetConfigs: () => {
        return apiClient.get('/tet-configs'); 
    },

    getTimelinePhases: (tetConfigId: string) => {
        return apiClient.get(`/timeline-phases/tet-config/${tetConfigId}`);
    },

    createTimelinePhase: (data: any) => {
        return apiClient.post('/timeline-phases', data);
    },  

    getTodoItems: (tetConfigId: string, phaseId: string) => {
        return apiClient.get(`/todo-items`, {
            params: {
                tet_config_id: tetConfigId,
                timeline_phase_id: phaseId
            }
        });
    },

    addTodoItem: (data: any) => {
        return apiClient.post('/todo-items', data);
    },

    updateTodoItemStatus: (id: string, status: string) => {
        return apiClient.patch(`/todo-items/${id}`, { status });
    },

    updateTodoItem: (id: string, data: any) => {
        return apiClient.patch(`/todo-items/${id}`, data);
    },

    deleteTodoItem: (id: string) => {
        return apiClient.delete(`/todo-items/${id}`);
    },

    getCategories: () => {
        return apiClient.get('/categories');
    }
}