/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiClient';

export const collaboratorService = {

    getCollaborators: (tetConfigId: string) => {
        return apiClient.get(`/collaborators`, {
            params: {
                tet_config_id: tetConfigId
            }
        });
    },

    inviteCollaborator: (data: { tet_config_id: string; [key: string]: any }) => {
        return apiClient.post('/collaborators', data);
    },

    removeCollaborator: (collaboratorId: string) => {
        return apiClient.patch(`/collaborators/${collaboratorId}`, { is_deleted: true });
    },

    updateCollaborator: (id: string, data: any) => {
        return apiClient.patch(`/collaborators/${id}`, data);
    },

    getMyInvitations: () => {
        return apiClient.get('/collaborators/my-invitations');
    },

    acceptInvitation: (id: string) => {
        return apiClient.patch(`/collaborators/${id}/accept`, {});
    },

    declineInvitation: (id: string) => {
        return apiClient.patch(`/collaborators/${id}/decline`, {});
    }
}