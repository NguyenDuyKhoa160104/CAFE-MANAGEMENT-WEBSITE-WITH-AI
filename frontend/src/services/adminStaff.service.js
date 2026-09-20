import { adminApi } from "../config/axios.config";

export const adminStaffService = {
    getStaffs(params = {}) {
        return adminApi.get("/staffs", { params });
    },

    getStaff(id) {
        return adminApi.get(`/staffs/${id}`);
    },

    createStaff(payload) {
        return adminApi.post("/staffs", payload);
    },

    updateStaff(id, payload) {
        // Fallback to POST for multipart form-data because of PHP PUT limitation
        return adminApi.post(`/staffs/${id}`, payload);
    },

    deleteStaff(id) {
        return adminApi.delete(`/staffs/${id}`);
    },

    updateStaffStatus(id, status) {
        return adminApi.patch(`/staffs/${id}/status`, { status });
    },

    resetStaffPassword(id, payload) {
        return adminApi.patch(`/staffs/${id}/reset-password`, payload);
    },
};
