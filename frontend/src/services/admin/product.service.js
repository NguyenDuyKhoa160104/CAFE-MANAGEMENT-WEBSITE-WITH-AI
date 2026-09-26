import { adminApi } from "../../config/axios.config";

const BASE_URL = "/products";

export const productService = {
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
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return await adminApi.post(`${BASE_URL}/${id}`, data);
        }
        return await adminApi.put(`${BASE_URL}/${id}`, data);
    },

    delete: async (id) => {
        return await adminApi.delete(`${BASE_URL}/${id}`);
    },

    updateStatus: async (id, status) => {
        return await adminApi.patch(`${BASE_URL}/${id}/status`, { status });
    },

    toggleFeatured: async (id, is_featured) => {
        return await adminApi.patch(`${BASE_URL}/${id}/featured`, { is_featured });
    },

    removeImage: async (id) => {
        return await adminApi.delete(`${BASE_URL}/${id}/image`);
    }
};
