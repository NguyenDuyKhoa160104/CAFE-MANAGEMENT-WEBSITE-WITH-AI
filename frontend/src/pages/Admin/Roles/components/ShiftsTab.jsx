import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ShiftModal from './ShiftModal';

const ShiftsTab = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedShift, setSelectedShift] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await hrApi.getWorkShifts();
            setShifts(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu ca làm việc: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedShift(null);
        setIsModalOpen(true);
    };

    const handleEdit = (shift) => {
        setSelectedShift(shift);
        setIsModalOpen(true);
    };

    const handleDelete = async (shift) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ca làm việc "${shift.name}"?`)) return;
        try {
            await hrApi.deleteWorkShift(shift.id);
            toast.success('Xóa ca làm việc thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa ca làm việc');
        }
    };

    const handleToggleStatus = async (shift) => {
        try {
            const newStatus = shift.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await hrApi.updateWorkShiftStatus(shift.id, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#49332b]">Danh sách Ca làm việc</h3>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#9c513d] text-white px-4 py-2 rounded-lg hover:bg-[#7a3f2f] transition"
                >
                    <Plus size={16} /> Thêm ca
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-[#ebe3dd]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fbfaf9] text-[#65473c] border-b border-[#ebe3dd]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Mã Ca</th>
                                <th className="px-4 py-3 font-semibold">Tên Ca</th>
                                <th className="px-4 py-3 font-semibold">Thời gian</th>
                                <th className="px-4 py-3 font-semibold">Cho phép trễ</th>
                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map(shift => (
                                <tr key={shift.id} className="border-b border-[#ebe3dd] hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">{shift.shift_code}</td>
                                    <td className="px-4 py-3">{shift.name}</td>
                                    <td className="px-4 py-3">
                                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                    </td>
                                    <td className="px-4 py-3">{shift.grace_minutes} phút</td>
                                    <td className="px-4 py-3">
                                        <button 
                                            onClick={() => handleToggleStatus(shift)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded w-max ${shift.status === 'ACTIVE' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                                        >
                                            {shift.status === 'ACTIVE' ? <><CheckCircle2 size={14} /> Hoạt động</> : <><XCircle size={14} /> Khóa</>}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(shift)} className="text-blue-600 hover:text-blue-800 p-1" title="Sửa">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(shift)} className="text-red-600 hover:text-red-800 p-1 ml-2" title="Xóa">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <ShiftModal 
                    shift={selectedShift} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
};

export default ShiftsTab;
