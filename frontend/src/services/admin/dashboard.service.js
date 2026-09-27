import { adminApi } from '../../config/axios.config';

export const getDashboard = (params, signal) => adminApi.get('/dashboard', { params, signal });
