import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const AssignmentModal = ({ assignment, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        staff_id: '',
        work_shift_id: '',
        work_date: new Date().toISOString().split('T')[0],
        note: ''
    });
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [staffRes, shiftRes] = await Promise.all([
                    hrApi.getStaffs(),
                    hrApi.getWorkShifts()
                ]);
                setStaffs(staffRes.data.data || staffRes.data);
                setShifts(shiftRes.data.filter(s => s.status === 'ACTIVE'));
                
                if (!assignment) {
                    const staffsArray = staffRes.data.data || staffRes.data;
                    setFormData(prev => ({
                        ...prev,
                        staff_id: staffsArray[0]?.id || '',
                        work_shift_id: shiftRes.data[0]?.id || ''
                    }));
                }
            } catch (error) {}
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (assignment) {
            setFormData({
                staff_id: assignment.staff_id,
                work_shift_id: assignment.work_shift_id,
                work_date: assignment.work_date,
                note: assignment.note || ''
            });
        }
    }, [assignment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (assignment) {
                await hrApi.updateAssignment(assignment.id, formData);
                toast.success('Cập nhật phân ca thành công');
            } else {
                await hrApi.createAssignment(formData);
                toast.success('Phân ca thành công');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi lưu phân ca');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">{assignment ? 'Sửa Phân ca' : 'Phân ca mới'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nhân viên *</label>
                        <select required value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]">
                            <option value="">-- Chọn nhân viên --</option>
                            {staffs.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.staff_code} - {staff.full_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ca làm việc *</label>
                        <select required value={formData.work_shift_id} onChange={e => setFormData({...formData, work_shift_id: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]">
                            <option value="">-- Chọn ca --</option>
                            {shifts.map(shift => (
                                <option key={shift.id} value={shift.id}>{shift.name} ({shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày làm việc *</label>
                        <input type="date" required value={formData.work_date} onChange={e => setFormData({...formData, work_date: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
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

export default AssignmentModal;
