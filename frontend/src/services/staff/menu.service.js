import { staffApi } from "../../config/axios.config";

export const staffMenuService = {
    getCategories: async (params) => {
        const response = await staffApi.get('/categories', { params });
        return response.data;
    },
    
    getProducts: async (params) => {
        const response = await staffApi.get('/products', { params });
        return response.data;
    },

    getProductDetail: async (id) => {
        const response = await staffApi.get(`/products/${id}`);
        return response.data;
    }
};
