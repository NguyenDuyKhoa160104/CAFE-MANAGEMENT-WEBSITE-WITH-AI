import { staffApi } from '../../config/axios.config';

export const dashboardService = {
    getDashboard: () => staffApi.get('/dashboard'),
    checkIn: (data) => staffApi.post('/attendance/check-in', data),
    checkOut: (data) => staffApi.post('/attendance/check-out', data),
};
