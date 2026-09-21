import { staffApi } from "../../config/axios.config";

export const staffOrderService = {
    getOrders: async (params) => {
        const response = await staffApi.get('/orders', { params });
        const paginator = response.data;
        return {
            orders: Array.isArray(paginator?.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []),
            pagination: {
                currentPage: paginator?.current_page ?? 1,
                lastPage: paginator?.last_page ?? 1,
                perPage: paginator?.per_page ?? 15,
                total: paginator?.total ?? 0,
            }
        };
    },
    
    createOrder: async (data) => {
        const response = await staffApi.post('/orders', data);
        return response.data;
    },

    getOrderDetail: async (id) => {
        const response = await staffApi.get(`/orders/${id}`);
        return response.data;
    },

    updateOrder: async (id, data) => {
        const response = await staffApi.put(`/orders/${id}`, data);
        return response.data;
    },

    addItem: async (id, data) => {
        const response = await staffApi.post(`/orders/${id}/items`, data);
        return response.data;
    },

    updateItem: async (id, itemId, data) => {
        const response = await staffApi.put(`/orders/${id}/items/${itemId}`, data);
        return response.data;
    },

    removeItem: async (id, itemId) => {
        const response = await staffApi.delete(`/orders/${id}/items/${itemId}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await staffApi.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    cancelOrder: async (id, reason) => {
        const response = await staffApi.patch(`/orders/${id}/cancel`, { reason });
        return response.data;
    },

    checkoutOrder: async (id, data) => {
        const response = await staffApi.post(`/orders/${id}/checkout`, data);
        return response.data;
    }
};
