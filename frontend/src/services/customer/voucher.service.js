import { customerApi } from '../../config/axios.config';

const customerVoucherService = {
  getVouchers: (params) => customerApi.get('/vouchers', { params }),
  getVoucher: (id) => customerApi.get(`/vouchers/${id}`),
  previewVoucher: (id, payload) => customerApi.post(`/vouchers/${id}/preview`, payload),
};

export default customerVoucherService;
