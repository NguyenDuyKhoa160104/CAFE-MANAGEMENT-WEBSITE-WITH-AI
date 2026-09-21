import { adminApi } from "../../config/axios.config";

export const adminOrderService = {
    getOrders: async (params) => {
        const response = await adminApi.get('/orders', { params });
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

    getSummary: async (params) => {
        const response = await adminApi.get('/orders/summary', { params });
        return response.data;
    },

    getOrderDetail: async (id) => {
        const response = await adminApi.get(`/orders/${id}`);
        return response.data;
    }
};
