import { staffApi } from "../../config/axios.config";

export const staffInvoiceService = {
    getInvoices: async (params) => {
        const response = await staffApi.get('/invoices', { params });
        const paginator = response.data;
        return {
            invoices: Array.isArray(paginator?.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []),
            pagination: {
                currentPage: paginator?.current_page ?? 1,
                lastPage: paginator?.last_page ?? 1,
                perPage: paginator?.per_page ?? 15,
                total: paginator?.total ?? 0,
            }
        };
    },

    getInvoiceDetail: async (id) => {
        const response = await staffApi.get(`/invoices/${id}`);
        return response.data;
    }
};
