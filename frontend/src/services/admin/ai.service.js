import { adminApi } from '../../config/axios.config';

export const adminAIService = {
    // Settings
    getSettings: () => adminApi.get('/ai/settings'),
    updateSettings: (data) => adminApi.put('/ai/settings', data),

    // Overview
    getOverview: () => adminApi.get('/ai/overview'),

    // Knowledge
    getKnowledge: (params) => adminApi.get('/ai/knowledge', { params }),
    getKnowledgeDetail: (id) => adminApi.get(`/ai/knowledge/${id}`),
    createKnowledge: (data) => adminApi.post('/ai/knowledge', data),
    updateKnowledge: (id, data) => adminApi.put(`/ai/knowledge/${id}`, data),
    updateKnowledgeStatus: (id, status) => adminApi.patch(`/ai/knowledge/${id}/status`, { status }),
    deleteKnowledge: (id) => adminApi.delete(`/ai/knowledge/${id}`),

    // Conversations
    getConversations: (params) => adminApi.get('/ai/conversations', { params }),
    getConversationDetail: (id) => adminApi.get(`/ai/conversations/${id}`),
};
