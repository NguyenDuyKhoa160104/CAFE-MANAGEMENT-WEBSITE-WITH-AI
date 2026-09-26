import { customerApi } from "../../config/axios.config";

export const customerReservationService = {
    getAvailableTables: (params) => {
        return customerApi.get("/reservations/available-tables", { params });
    },
    getReservations: (params) => {
        return customerApi.get("/reservations", { params });
    },
    getReservationDetail: (id) => {
        return customerApi.get(`/reservations/${id}`);
    },
    createReservation: (payload) => {
        return customerApi.post("/reservations", payload);
    },
    cancelReservation: (id) => {
        return customerApi.patch(`/reservations/${id}/cancel`);
    }
};
