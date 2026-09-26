import React, { useState, useEffect } from 'react';
import { 
  TicketPercent, 
  CalendarClock, 
  CheckCircle2, 
  Ban, 
  Clock3 
} from 'lucide-react';
import voucherService from '../../../services/customer/voucher.service';
import { showSuccess, showError } from '../../../utils/toast';

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UNUSED');

  useEffect(() => {
    fetchVouchers();
  }, [filter]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVouchers({ status: filter === 'ALL' ? '' : filter });
      setVouchers(res.data?.data || res.data || []);
    } catch (error) {
      showError('Lỗi khi tải danh sách ví voucher');
    } finally {
      setLoading(false);
    }
  };

  const isExpiredDate = (expiry) => {
    if (!expiry) return false;
    return new Date(expiry).getTime() < new Date().getTime();
  };

  const getStatusBadge = (status, expiry) => {
    const isExpired = isExpiredDate(expiry);
    if (isExpired && status === 'UNUSED') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1"><Clock3 size={12}/> Hết hạn</span>;
    }
    
    switch(status) {
      case 'UNUSED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={12}/> Có thể dùng</span>;
      case 'RESERVED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1"><Clock3 size={12}/> Đang chờ xử lý</span>;
      case 'USED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"><CheckCircle2 size={12}/> Đã sử dụng</span>;
      case 'REVOKED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1"><Ban size={12}/> Đã thu hồi</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <TicketPercent size={32} className="text-[#8e7d5f]" />
        <h1 className="text-3xl font-bold text-gray-900 font-playfair">Ví Voucher Của Tôi</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['UNUSED', 'USED', 'ALL'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-[#8e7d5f] text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'UNUSED' ? 'Chưa sử dụng' : status === 'USED' ? 'Đã sử dụng' : 'Tất cả'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8e7d5f]"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <TicketPercent size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có voucher nào</h3>
          <p className="text-gray-500">Bạn chưa có voucher nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map(voucher => {
            const promo = voucher.promotion;
            const isExpired = isExpiredDate(voucher.expires_at);
            const isUsable = voucher.status === 'UNUSED' && !isExpired;
            
            return (
              <div 
                key={voucher.id} 
                className={`bg-white rounded-2xl p-5 shadow-sm border flex flex-col justify-between ${isUsable ? 'border-[#8e7d5f]/30 hover:shadow-md transition-shadow' : 'border-gray-200 opacity-75'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-[#8e7d5f]/10 p-2 rounded-lg">
                      <TicketPercent size={24} className="text-[#8e7d5f]" />
                    </div>
                    {getStatusBadge(voucher.status, voucher.expires_at)}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{promo.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promo.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      Giảm: <strong className="text-gray-700">
                        {promo.discount_type === 'PERCENTAGE' 
                          ? `${promo.discount_value}% (Tối đa ${formatCurrency(promo.max_discount_amount)})`
                          : formatCurrency(promo.discount_value)}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      Đơn tối thiểu: <span className="text-gray-700">{formatCurrency(promo.min_order_amount || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarClock size={14} />
                    {voucher.expires_at ? `HSD: ${formatDate(voucher.expires_at)}` : 'Không thời hạn'}
                  </div>
                  {isUsable && (
                    <button 
                      onClick={() => window.location.href = '/menu'}
                      className="text-sm font-medium text-[#8e7d5f] hover:text-[#7a6a4f]"
                    >
                      Dùng ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Vouchers;
