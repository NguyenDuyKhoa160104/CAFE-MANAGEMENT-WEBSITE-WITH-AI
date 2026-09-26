import { adminApi } from '../../config/axios.config';

const adminCustomerVoucherService = {
  getVouchers: (params) => adminApi.get('/customer-vouchers', { params }),
  assignVoucher: (payload) => adminApi.post('/customer-vouchers', payload),
  revokeVoucher: (id) => adminApi.patch(`/customer-vouchers/${id}/revoke`),
};

export default adminCustomerVoucherService;
