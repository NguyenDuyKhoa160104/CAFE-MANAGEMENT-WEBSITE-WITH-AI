import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AttendanceAdjustModal from './AttendanceAdjustModal';

const AttendanceTab = () => {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await hrApi.getAttendances();
            setAttendances(res.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu chấm công: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (record) => {
        setSelectedAttendance(record);
        setIsModalOpen(true);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'PRESENT': return 'text-green-600 bg-green-50';
            case 'LATE': return 'text-orange-600 bg-orange-50';
            case 'ABSENT': return 'text-red-600 bg-red-50';
            case 'LEAVE': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#49332b]">Dữ liệu Chấm công</h3>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-[#ebe3dd]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fbfaf9] text-[#65473c] border-b border-[#ebe3dd]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Ngày</th>
                                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                                <th className="px-4 py-3 font-semibold">Ca làm việc</th>
                                <th className="px-4 py-3 font-semibold">Vào / Ra</th>
                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 font-semibold">Thông số</th>
                                <th className="px-4 py-3 font-semibold text-right">Điều chỉnh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.map(record => (
                                <tr key={record.id} className="border-b border-[#ebe3dd] hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">
                                        {new Date(record.work_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium">{record.staff?.full_name}</span> <br/>
                                        <span className="text-xs text-gray-500">{record.staff?.staff_code}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {record.work_shift ? record.work_shift.name : 'Ca linh hoạt'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatTime(record.check_in_at)} <br/>
                                        <span className="text-gray-400">đến</span> {formatTime(record.check_out_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusStyle(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        Trễ: {record.late_minutes} phút <br/>
                                        Thêm: {record.overtime_minutes} phút <br/>
                                        Làm: {record.worked_minutes} phút
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 p-1" title="Điều chỉnh">
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <AttendanceAdjustModal 
                    attendance={selectedAttendance} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
};

export default AttendanceTab;
