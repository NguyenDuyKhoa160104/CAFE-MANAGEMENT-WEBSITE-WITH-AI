import { adminApi } from '../../../config/axios.config';

export const hrApi = {
    // Roles
    getRoles: () => adminApi.get('/roles'),
    getRoleDetail: (id) => adminApi.get(`/roles/${id}`),
    createRole: (data) => adminApi.post('/roles', data),
    updateRole: (id, data) => adminApi.put(`/roles/${id}`, data),
    updateRoleStatus: (id, status) => adminApi.patch(`/roles/${id}/status`, { status }),
    deleteRole: (id) => adminApi.delete(`/roles/${id}`),
    updateRolePermissions: (id, permissions) => adminApi.put(`/roles/${id}/permissions`, { permissions }),
    getPermissions: () => adminApi.get('/permissions'),

    // Work Shifts
    getWorkShifts: () => adminApi.get('/work-shifts'),
    createWorkShift: (data) => adminApi.post('/work-shifts', data),
    updateWorkShift: (id, data) => adminApi.put(`/work-shifts/${id}`, data),
    updateWorkShiftStatus: (id, status) => adminApi.patch(`/work-shifts/${id}/status`, { status }),
    deleteWorkShift: (id) => adminApi.delete(`/work-shifts/${id}`),

    // Assignments
    getAssignments: (params) => adminApi.get('/shift-assignments', { params }),
    createAssignment: (data) => adminApi.post('/shift-assignments', data),
    updateAssignment: (id, data) => adminApi.put(`/shift-assignments/${id}`, data),
    deleteAssignment: (id) => adminApi.delete(`/shift-assignments/${id}`),

    getStaffs: () => adminApi.get('/staffs'),

    // Attendances
    getAttendances: (params) => adminApi.get('/attendance', { params }),
    adjustAttendance: (id, data) => adminApi.patch(`/attendance/${id}/adjust`, data),
};
