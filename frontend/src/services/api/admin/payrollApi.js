import { adminApi } from '../../../config/axios.config';

export const payrollApi = {
    getPeriods: () => adminApi.get('/payroll-periods'),
    getPeriodDetail: (id) => adminApi.get(`/payroll-periods/${id}`),
    createPeriod: (data) => adminApi.post('/payroll-periods', data),
    updatePeriod: (id, data) => adminApi.put(`/payroll-periods/${id}`, data),
    deletePeriod: (id) => adminApi.delete(`/payroll-periods/${id}`),
    generatePayroll: (id) => adminApi.post(`/payroll-periods/${id}/generate`),
    confirmPeriod: (id) => adminApi.post(`/payroll-periods/${id}/confirm`),
    markPaidPeriod: (id) => adminApi.post(`/payroll-periods/${id}/mark-paid`),
    adjustPayroll: (id, data) => adminApi.patch(`/payrolls/${id}/adjustments`, data),
};
