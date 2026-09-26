import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../services/api/admin/payrollApi';
import { Plus, Edit2, Trash2, Calculator, CheckCircle2, DollarSign, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageHeader from '../../../components/common/PageHeader';
import PeriodModal from './components/PeriodModal';

const PayrollManagement = () => {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await payrollApi.getPeriods();
            setPeriods(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu kỳ lương: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'DRAFT': return 'text-orange-600 bg-orange-50';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-50';
            case 'PAID': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleCreate = () => {
        setSelectedPeriod(null);
        setIsModalOpen(true);
    };

    const handleEdit = (period) => {
        setSelectedPeriod(period);
        setIsModalOpen(true);
    };

    const handleDelete = async (period) => {
        if (!window.confirm(`Bạn có chắc muốn xóa kỳ lương "${period.name}"?`)) return;
        try {
            await payrollApi.deletePeriod(period.id);
            toast.success('Xóa kỳ lương thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa kỳ lương');
        }
    };

    const handleGenerate = async (id) => {
        if (!window.confirm("Hệ thống sẽ tổng hợp chấm công trong kỳ và tạo/cập nhật bảng lương. Bạn có muốn tiếp tục?")) return;
        try {
            await payrollApi.generatePayroll(id);
            toast.success('Đã tính lương thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi tính lương');
        }
    };

    const handleConfirm = async (id) => {
        if (!window.confirm("Sau khi xác nhận, bảng lương sẽ bị khóa và không thể tính lại hoặc điều chỉnh.")) return;
        try {
            await payrollApi.confirmPeriod(id);
            toast.success('Đã xác nhận kỳ lương');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xác nhận kỳ lương');
        }
    };

    const handlePaid = async (id) => {
        if (!window.confirm("Xác nhận đã thanh toán bảng lương kỳ này?")) return;
        try {
            await payrollApi.markPaidPeriod(id);
            toast.success('Đã đánh dấu thanh toán');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi đánh dấu thanh toán');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Quản lý bảng lương" 
                subtitle="Tính lương, xác nhận và quản lý kỳ lương nhân viên"
            />
            
            <div className="bg-white rounded-xl border border-[#ebe3dd] p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#49332b]">Danh sách Kỳ lương</h3>
                    <button 
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-[#9c513d] text-white px-4 py-2 rounded-lg hover:bg-[#7a3f2f] transition"
                    >
                        <Plus size={16} /> Tạo kỳ lương mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>
                ) : periods.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Chưa có kỳ lương nào.</p>
                        <button onClick={handleCreate} className="text-[#9c513d] font-semibold hover:underline">Tạo kỳ lương ngay</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-[#ebe3dd]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#fbfaf9] text-[#65473c] border-b border-[#ebe3dd]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Mã / Tên kỳ</th>
                                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                                    <th className="px-4 py-3 font-semibold">Ngày công c/c</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map(period => (
                                    <tr key={period.id} className="border-b border-[#ebe3dd] hover:bg-[#fbfaf9]">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-[#49332b]">{period.name}</span> <br/>
                                            <span className="text-xs text-gray-500">{period.period_code}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(period.start_date).toLocaleDateString('vi-VN')} - {new Date(period.end_date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 text-center">{period.standard_work_days}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusStyle(period.status)}`}>
                                                {period.status === 'DRAFT' ? 'Bản nháp' : period.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã thanh toán'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800 p-1" title="Xem chi tiết">
                                                <Eye size={16} />
                                            </button>
                                            
                                            {period.status === 'DRAFT' && (
                                                <>
                                                    <button onClick={() => handleEdit(period)} className="text-blue-600 hover:text-blue-800 p-1" title="Sửa">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleGenerate(period.id)} className="text-orange-600 hover:text-orange-800 p-1" title="Tính lương">
                                                        <Calculator size={16} />
                                                    </button>
                                                    <button onClick={() => handleConfirm(period.id)} className="text-green-600 hover:text-green-800 p-1" title="Xác nhận">
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(period)} className="text-red-600 hover:text-red-800 p-1 ml-2" title="Xóa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {period.status === 'CONFIRMED' && (
                                                <button onClick={() => handlePaid(period.id)} className="text-green-600 hover:text-green-800 p-1" title="Đánh dấu đã thanh toán">
                                                    <DollarSign size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PeriodModal 
                    period={selectedPeriod} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
};

export default PayrollManagement;
