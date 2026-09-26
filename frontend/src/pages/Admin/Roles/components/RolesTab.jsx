import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoleModal from './RoleModal';
import PermissionModal from './PermissionModal';

const RolesTab = () => {
    const [roles, setRoles] = useState([]);
    const [permissionsData, setPermissionsData] = useState({});
    const [loading, setLoading] = useState(true);

    const [selectedRole, setSelectedRole] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    
    const [selectedRolePerms, setSelectedRolePerms] = useState(null);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                hrApi.getRoles(),
                hrApi.getPermissions()
            ]);
            setRoles(rolesRes.data);
            setPermissionsData(permsRes.data);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu vai trò: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedRole(null);
        setIsRoleModalOpen(true);
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) return;
        try {
            await hrApi.deleteRole(role.id);
            toast.success('Xóa vai trò thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa vai trò');
        }
    };

    const handleToggleStatus = async (role) => {
        if (role.is_system) return;
        try {
            const newStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await hrApi.updateRoleStatus(role.id, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
        }
    };

    const handleOpenPermissions = async (role) => {
        try {
            const res = await hrApi.getRoleDetail(role.id);
            setSelectedRolePerms(res.data);
            setIsPermModalOpen(true);
        } catch (error) {
            toast.error('Lỗi khi tải quyền của vai trò');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-200">
                Vai trò quyết định Staff được phép sử dụng những chức năng nào trong hệ thống. Chức danh công việc không đồng nghĩa với quyền truy cập.
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#49332b]">Danh sách Vai trò</h3>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[#9c513d] text-white px-4 py-2 rounded-lg hover:bg-[#7a3f2f] transition"
                >
                    <Plus size={16} /> Thêm vai trò
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9c513d]"></div></div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-[#ebe3dd]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#fbfaf9] text-[#65473c] border-b border-[#ebe3dd]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Mã Vai trò</th>
                                <th className="px-4 py-3 font-semibold">Tên Vai trò</th>
                                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id} className="border-b border-[#ebe3dd] hover:bg-[#fbfaf9]">
                                    <td className="px-4 py-3 font-medium text-[#49332b]">
                                        {role.role_code}
                                        {role.is_system && <span className="ml-2 text-xs bg-gray-200 px-1 rounded">System</span>}
                                    </td>
                                    <td className="px-4 py-3">{role.name}</td>
                                    <td className="px-4 py-3">{role.staffs_count || 0}</td>
                                    <td className="px-4 py-3">
                                        <button 
                                            onClick={() => handleToggleStatus(role)}
                                            disabled={role.is_system}
                                            className={`flex items-center gap-1 px-2 py-1 rounded w-max ${role.status === 'ACTIVE' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'} ${role.is_system ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {role.status === 'ACTIVE' ? <><CheckCircle2 size={14} /> Hoạt động</> : <><XCircle size={14} /> Khóa</>}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleOpenPermissions(role)} className="text-purple-600 hover:text-purple-800 p-1" title="Phân quyền">
                                            <Shield size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800 p-1 ml-2" title="Sửa">
                                            <Edit2 size={16} />
                                        </button>
                                        {!role.is_system && (
                                            <button onClick={() => handleDelete(role)} className="text-red-600 hover:text-red-800 p-1 ml-2" title="Xóa">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isRoleModalOpen && (
                <RoleModal 
                    role={selectedRole} 
                    onClose={() => setIsRoleModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}

            {isPermModalOpen && (
                <PermissionModal 
                    role={selectedRolePerms} 
                    allPermissions={permissionsData}
                    onClose={() => setIsPermModalOpen(false)} 
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
};

export default RolesTab;
