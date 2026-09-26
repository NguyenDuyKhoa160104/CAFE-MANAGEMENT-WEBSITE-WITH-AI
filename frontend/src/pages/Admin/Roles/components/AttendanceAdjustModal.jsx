import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const AttendanceAdjustModal = ({ attendance, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        check_in_at: '',
        check_out_at: '',
        status: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (attendance) {
            const formatForInput = (isoString) => {
                if (!isoString) return '';
                const d = new Date(isoString);
                const tzOffset = d.getTimezoneOffset() * 60000;
                return (new Date(d - tzOffset)).toISOString().slice(0, 16);
            };

            setFormData({
                check_in_at: formatForInput(attendance.check_in_at),
                check_out_at: formatForInput(attendance.check_out_at),
                status: attendance.status,
                note: attendance.note || ''
            });
        }
    }, [attendance]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await hrApi.adjustAttendance(attendance.id, {
                check_in_at: formData.check_in_at ? new Date(formData.check_in_at).toISOString() : null,
                check_out_at: formData.check_out_at ? new Date(formData.check_out_at).toISOString() : null,
                status: formData.status,
                note: formData.note
            });
            toast.success('Điều chỉnh chấm công thành công');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi điều chỉnh');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="font-bold text-lg">Điều chỉnh chấm công</h3>
                        <p className="text-sm text-gray-500">{attendance?.staff?.full_name} - {new Date(attendance?.work_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Giờ vào</label>
                        <input type="datetime-local" value={formData.check_in_at} onChange={e => setFormData({...formData, check_in_at: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giờ ra</label>
                        <input type="datetime-local" value={formData.check_out_at} onChange={e => setFormData({...formData, check_out_at: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái *</label>
                        <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]">
                            <option value="PRESENT">Có mặt (PRESENT)</option>
                            <option value="LATE">Đi trễ (LATE)</option>
                            <option value="ABSENT">Vắng (ABSENT)</option>
                            <option value="LEAVE">Nghỉ phép (LEAVE)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Lý do điều chỉnh</label>
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

export default AttendanceAdjustModal;
