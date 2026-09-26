import { customerApi } from "../../config/axios.config";

export const customerInvoiceService = {
    getInvoices: (params) => {
        return customerApi.get("/invoices", { params });
    },
    getInvoiceDetail: (id) => {
        return customerApi.get(`/invoices/${id}`);
    }
};
