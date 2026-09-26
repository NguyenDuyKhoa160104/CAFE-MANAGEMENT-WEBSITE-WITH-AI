import { customerApi } from "../../config/axios.config";

export const customerOrderService = {
    getOrders: (params) => {
        return customerApi.get("/orders", { params });
    },
    getOrderDetail: (id) => {
        return customerApi.get(`/orders/${id}`);
    },
    createOrder: (payload) => {
        return customerApi.post("/orders", payload);
    },
    cancelOrder: (id) => {
        return customerApi.patch(`/orders/${id}/cancel`);
    }
};
