import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../../services/api/admin/payrollApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const PeriodModal = ({ period, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        period_code: '',
        name: '',
        start_date: '',
        end_date: '',
        standard_work_days: 26,
        note: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (period) {
            setFormData({
                period_code: period.period_code,
                name: period.name,
                start_date: period.start_date.split('T')[0],
                end_date: period.end_date.split('T')[0],
                standard_work_days: period.standard_work_days,
                note: period.note || ''
            });
        }
    }, [period]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (period) {
                await payrollApi.updatePeriod(period.id, formData);
                toast.success('Cập nhật kỳ lương thành công');
            } else {
                await payrollApi.createPeriod(formData);
                toast.success('Thêm kỳ lương thành công');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi lưu kỳ lương');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">{period ? 'Sửa Kỳ lương' : 'Thêm Kỳ lương'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mã kỳ *</label>
                            <input type="text" required value={formData.period_code} onChange={e => setFormData({...formData, period_code: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d] uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên kỳ *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" placeholder="VD: Lương tháng 10/2026"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
                            <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày kết thúc *</label>
                            <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày công chuẩn (tiêu chuẩn 26)</label>
                        <input type="number" step="0.5" min="1" required value={formData.standard_work_days} onChange={e => setFormData({...formData, standard_work_days: parseFloat(e.target.value)})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ghi chú</label>
                        <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" rows={2}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#9c513d] text-white rounded-lg hover:bg-[#7a3f2f] disabled:opacity-50">
                            {loading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PeriodModal;
