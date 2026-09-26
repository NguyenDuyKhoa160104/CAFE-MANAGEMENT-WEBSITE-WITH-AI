import { adminApi } from "../../config/axios.config";

const BASE_URL = "/promotions";

export const promotionService = {
    getAll: async (params) => {
        return await adminApi.get(BASE_URL, { params });
    },

    getById: async (id) => {
        return await adminApi.get(`${BASE_URL}/${id}`);
    },

    create: async (data) => {
        return await adminApi.post(BASE_URL, data);
    },

    update: async (id, data) => {
        return await adminApi.put(`${BASE_URL}/${id}`, data);
    },

    delete: async (id) => {
        return await adminApi.delete(`${BASE_URL}/${id}`);
    },

    updateStatus: async (id, status) => {
        return await adminApi.patch(`${BASE_URL}/${id}/status`, { status });
    }
};
