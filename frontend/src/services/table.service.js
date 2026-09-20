import { adminApi } from "../config/axios.config";

export const tableService = {
    // =========================
    // AREAS
    // =========================

    getAreas(params = {}) {
        return adminApi.get("/areas", { params });
    },

    getArea(id) {
        return adminApi.get(`/areas/${id}`);
    },

    createArea(payload) {
        return adminApi.post("/areas", payload);
    },

    updateArea(id, payload) {
        return adminApi.put(`/areas/${id}`, payload);
    },

    deleteArea(id) {
        return adminApi.delete(`/areas/${id}`);
    },

    updateAreaStatus(id, status) {
        return adminApi.patch(`/areas/${id}/status`, {
            status,
        });
    },

    // =========================
    // TABLES
    // =========================

    getTables(params = {}) {
        return adminApi.get("/tables", { params });
    },

    getTable(id) {
        return adminApi.get(`/tables/${id}`);
    },

    createTable(payload) {
        return adminApi.post("/tables", payload);
    },

    updateTable(id, payload) {
        return adminApi.put(`/tables/${id}`, payload);
    },

    deleteTable(id) {
        return adminApi.delete(`/tables/${id}`);
    },

    updateTableStatus(id, status) {
        return adminApi.patch(`/tables/${id}/status`, {
            status,
        });
    },
};
