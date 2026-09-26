import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AssignmentModal from './AssignmentModal';

const AssignmentsTab = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await hrApi.getAssignments();
            setAssignments(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu phân ca: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedAssignment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setIsModalOpen(true);
    };

    const handleDelete = async (assignment) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ca của ${assignment.staff?.full_name} ngày ${assignment.work_date}?`)) return;
        try {
            await hrApi.deleteAssignment(assignment.id);
            toast.success('Xóa phân ca thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa phân ca');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#49332b]">Lịch phân ca</h3>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#9c513d] text-white px-4 py-2 rounded-lg hover:bg-[#7a3f2f] transition"
                >
                    <Plus size={16} /> Phân ca mới
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-[#ebe3dd]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fbfaf9] text-[#65473c] border-b border-[#ebe3dd]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                                <th className="px-4 py-3 font-semibold">Ca làm việc</th>
                                <th className="px-4 py-3 font-semibold">Ngày làm việc</th>
                                <th className="px-4 py-3 font-semibold">Ghi chú</th>
                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(assignment => (
                                <tr key={assignment.id} className="border-b border-[#ebe3dd] hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">
                                        {assignment.staff?.full_name} <br />
                                        <span className="text-xs text-gray-500">{assignment.staff?.staff_code}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium">{assignment.work_shift?.name}</span> <br/>
                                        <span className="text-xs text-gray-500">
                                            {assignment.work_shift?.start_time?.slice(0, 5)} - {assignment.work_shift?.end_time?.slice(0, 5)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{new Date(assignment.work_date).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-3">{assignment.note || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(assignment)} className="text-blue-600 hover:text-blue-800 p-1" title="Sửa">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(assignment)} className="text-red-600 hover:text-red-800 p-1 ml-2" title="Xóa">
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
                <AssignmentModal 
                    assignment={selectedAssignment} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
};

export default AssignmentsTab;
