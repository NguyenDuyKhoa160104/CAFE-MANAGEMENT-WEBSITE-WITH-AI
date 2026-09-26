import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerInvoiceService } from '../../../services/customer/invoice.service';

import { showError } from '../../../utils/toast';
import { ArrowLeft, Printer } from 'lucide-react';
import { getApiErrorMessage } from '../../../utils/apiError';
import BrandLogo from '../../../components/common/BrandLogo';

const InvoiceDetail = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await customerInvoiceService.getInvoiceDetail(id);
                setInvoice(response.data || response || null);
            } catch (error) {
                showError(getApiErrorMessage(error) || "Không tìm thấy hóa đơn");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

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

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9DFD8] border-t-[#604238]"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] py-20 flex items-center justify-center">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-[#E9DFD8] text-center max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold mb-4 text-[#302723]">Không tìm thấy hóa đơn</h2>
                    <p className="text-[#958981] mb-8">Hóa đơn bạn đang tìm kiếm không tồn tại.</p>
                    <Link to="/invoices" className="inline-flex items-center justify-center gap-2 bg-[#604238] hover:bg-[#4a332b] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md">
                        <ArrowLeft size={18} /> Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20 print:bg-white print:py-0">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <Link to="/invoices" className="inline-flex items-center gap-2 text-[#958981] hover:text-[#604238] font-medium transition-colors">
                        <ArrowLeft size={16} /> Quay lại danh sách
                    </Link>
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-3 bg-white border border-[#E9DFD8] text-[#302723] rounded-xl font-bold shadow-sm hover:bg-[#F7F4F1] transition-all flex items-center gap-2"
                    >
                        <Printer size={18} /> In hóa đơn
                    </button>
                </div>

                {/* Print area */}
                <div className="bg-white rounded-3xl shadow-lg p-10 md:p-14 border border-[#E9DFD8] print:shadow-none print:border-none print:p-0 relative overflow-hidden">
                    {/* Decorative edge */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#604238] print:hidden"></div>
                    
                    <div className="text-center mb-10 pb-8 border-b-2 border-dashed border-[#E9DFD8]">
                        <div className="flex justify-center mb-6">
                            <BrandLogo />
                        </div>
                        <p className="text-sm font-medium text-[#958981]">123 Đường Cà Phê, Quận 1, TP. HCM</p>
                        <h2 className="text-2xl font-black mt-6 tracking-widest text-[#302723]">HÓA ĐƠN THANH TOÁN</h2>
                    </div>

                    <div className="flex justify-between text-sm mb-10 bg-[#F7F4F1]/50 p-6 rounded-2xl border border-[#E9DFD8]/50">
                        <div>
                            <p className="text-xs font-bold text-[#958981] uppercase tracking-wider mb-1">Mã hóa đơn</p>
                            <p className="font-black text-[#302723] text-lg">#{invoice.invoice_code}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[#958981] uppercase tracking-wider mb-1">Ngày xuất</p>
                            <p className="font-bold text-[#302723] text-base">{formatDateTime(invoice.issued_at)}</p>
                        </div>
                    </div>

                    <div className="mb-10 text-sm">
                        <p className="text-xs font-bold text-[#958981] uppercase tracking-wider mb-1">Khách hàng</p>
                        <p className="font-bold text-lg text-[#302723]">{invoice.customer?.full_name || 'Khách vãng lai'}</p>
                        <p className="text-[#958981] font-medium mt-1">Đơn hàng tham chiếu: <span className="font-bold text-[#302723]">#{invoice.order?.order_code}</span></p>
                    </div>

                    <div className="mb-10">
                        <div className="border-b-2 border-[#302723] pb-3 mb-4 font-bold text-[#302723] text-sm uppercase tracking-wider flex justify-between">
                            <span>Sản phẩm</span>
                            <span>Thành tiền</span>
                        </div>
                        <div className="space-y-4">
                            {invoice.order?.items?.map(item => (
                                <div key={item.id} className="text-sm flex justify-between items-start">
                                    <div className="flex-1 pr-4">
                                        <p className="font-bold text-[#302723]">{item.quantity} <span className="font-normal text-[#958981]">x</span> {item.product_name}</p>
                                        {item.note && <p className="text-xs text-[#958981] italic mt-1 bg-[#F7F4F1] inline-block px-2 py-0.5 rounded">Ghi chú: {item.note}</p>}
                                    </div>
                                    <p className="font-bold text-[#302723]">{formatPrice(item.line_total)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t-2 border-[#E9DFD8] pt-6 space-y-3 text-sm">
                        <div className="flex justify-between text-[#958981] font-medium">
                            <span>Tạm tính</span>
                            <span>{formatPrice(invoice.order?.subtotal || invoice.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-[#6F8F3D] font-medium">
                            <span>Giảm giá</span>
                            <span>-{formatPrice(invoice.order?.discount || 0)}</span>
                        </div>
                        <div className="flex justify-between font-black text-xl mt-6 border-t-2 border-[#302723] pt-6">
                            <span className="text-[#302723] uppercase tracking-wider text-lg">Tổng thanh toán</span>
                            <span className="text-[#604238]">{formatPrice(invoice.total_amount)}</span>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-sm border-t-2 border-dashed border-[#E9DFD8] pt-8">
                        <div className="inline-flex items-center justify-center px-4 py-2 bg-[#F7F4F1] rounded-xl mb-6">
                            <p className="text-[#958981] font-medium mr-2">Phương thức:</p>
                            <strong className="text-[#302723]">{getPaymentMethodLabel(invoice.payment_method)}</strong>
                        </div>
                        <p className="text-[#958981] italic text-lg font-serif">Cảm ơn quý khách và hẹn gặp lại!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
