import { adminApi } from '../../config/axios.config';

export const customerService = {
  getAll: (params) => adminApi.get('/customers', { params }),
};
