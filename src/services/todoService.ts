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

    updateTodoItem: (id: string, data: any) => {
        console.log(`3 Updating task ${id} with data:`, data);
        return apiClient.patch(`/todo-items/${id}`, data);
    },

    deleteTodoItem: (id: string) => {
        return apiClient.delete(`/todo-items/${id}`);
    },

    //   - Add or update a subtask (upsert by name)
    addOrUpdateSubtask: (taskId: string, subtaskData: any) => {
        return apiClient.put(`/todo-items/${taskId}/subtasks`, subtaskData);
    },

    // DELETE /todo-items/{id}/subtasks - Remove a subtask by name
    deleteSubtask: (taskId: string, subtaskName: string) => {
        return apiClient.delete(`/todo-items/${taskId}/subtasks`, {
            data: { name: subtaskName } 
        });
    },

    getCategories: () => {
        return apiClient.get('/categories');
    }
}