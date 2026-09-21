import { staffApi } from "../../config/axios.config";

export const staffTableService = {
    getAreas: async (params) => {
        const response = await staffApi.get('/areas', { params });
        return response.data;
    },
    
    getTables: async (params) => {
        const response = await staffApi.get('/tables', { params });
        return response.data;
    },

    getTableDetail: async (id) => {
        const response = await staffApi.get(`/tables/${id}`);
        return response.data;
    }
};
