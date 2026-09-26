import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const ShiftModal = ({ shift, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        shift_code: '',
        name: '',
        start_time: '07:00',
        end_time: '12:00',
        grace_minutes: 0,
        sort_order: 1,
        status: 'ACTIVE'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shift) {
            setFormData({
                shift_code: shift.shift_code,
                name: shift.name,
                start_time: shift.start_time.slice(0, 5),
                end_time: shift.end_time.slice(0, 5),
                grace_minutes: shift.grace_minutes,
                sort_order: shift.sort_order || 1,
                status: shift.status
            });
        }
    }, [shift]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (shift) {
                await hrApi.updateWorkShift(shift.id, formData);
                toast.success('Cập nhật ca làm việc thành công');
            } else {
                await hrApi.createWorkShift(formData);
                toast.success('Thêm ca làm việc thành công');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi lưu ca làm việc');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">{shift ? 'Sửa Ca làm việc' : 'Thêm Ca làm việc'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mã Ca *</label>
                            <input type="text" required value={formData.shift_code} onChange={e => setFormData({...formData, shift_code: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d] uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên Ca *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Giờ bắt đầu *</label>
                            <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Giờ kết thúc *</label>
                            <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cho phép đi trễ (phút)</label>
                            <input type="number" min="0" value={formData.grace_minutes} onChange={e => setFormData({...formData, grace_minutes: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                            <input type="number" min="1" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]">
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Khóa</option>
                        </select>
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

export default ShiftModal;
