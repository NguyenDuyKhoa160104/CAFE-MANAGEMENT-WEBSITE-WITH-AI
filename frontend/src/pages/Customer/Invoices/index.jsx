import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerInvoiceService } from '../../../services/customer/invoice.service';
import { CalendarDays, ReceiptText, ArrowRight, CreditCard, Receipt } from 'lucide-react';


const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await customerInvoiceService.getInvoices();
                setInvoices(response.data || response || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())} - ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'CASH': return 'Tiền mặt';
            case 'BANK_TRANSFER': return 'Chuyển khoản';
            default: return method;
        }
    };

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-3 mb-10">
                    <ReceiptText className="text-[#604238]" size={36} />
                    <h1 className="text-4xl font-bold text-[#302723]">Hóa đơn của tôi</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E9DFD8] border-t-[#604238]"></div></div>
                ) : invoices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="bg-white border border-[#E9DFD8] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group">
                                <div className="flex justify-between items-start mb-6 border-b border-[#E9DFD8] pb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238] flex-shrink-0">
                                            <Receipt size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-xl text-[#302723] tracking-wide">#{invoice.invoice_code}</div>
                                            <div className="text-sm font-medium text-[#958981] mt-1">Đơn hàng: #{invoice.order?.order_code || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-[#604238] text-2xl">{formatPrice(invoice.total_amount)}</div>
                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6F8F3D] bg-[#EEF4E5] px-2.5 py-1 rounded-md uppercase tracking-wider mt-2">
                                            <CreditCard size={12} /> {getPaymentMethodLabel(invoice.payment_method)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-[#302723] font-medium mb-6">
                                    <span className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-[#958981]" /> {formatDateTime(invoice.issued_at)}</span>
                                </div>
                                <div className="pt-2">
                                    <Link to={`/invoices/${invoice.id}`} className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-[#E9DFD8] text-[#302723] font-bold rounded-xl hover:border-[#604238] hover:text-[#604238] hover:bg-[#F7F4F1] transition-all group-hover:bg-[#F7F4F1]">
                                        Xem chi tiết hóa đơn <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-[#E9DFD8] flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#F7F4F1] rounded-full flex items-center justify-center mb-6 text-[#958981]">
                            <ReceiptText size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#302723] mb-3">Bạn chưa có hóa đơn nào</h3>
                        <p className="text-[#958981] mb-8 max-w-sm leading-relaxed">Hóa đơn sẽ được tạo tự động và hiển thị tại đây sau khi đơn hàng của bạn hoàn tất thanh toán.</p>
                        <Link to="/orders" className="inline-flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
                            Xem Đơn hàng <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoices;
