import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const RoleModal = ({ role, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        role_code: '',
        name: '',
        description: '',
        status: 'ACTIVE'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role) {
            setFormData({
                role_code: role.role_code,
                name: role.name,
                description: role.description || '',
                status: role.status
            });
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role) {
                await hrApi.updateRole(role.id, formData);
                toast.success('Cập nhật vai trò thành công');
            } else {
                await hrApi.createRole(formData);
                toast.success('Thêm vai trò thành công');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi lưu vai trò');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">{role ? 'Sửa Vai trò' : 'Thêm Vai trò'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Mã Vai trò *</label>
                        <input type="text" required value={formData.role_code} onChange={e => setFormData({...formData, role_code: e.target.value})} disabled={role && role.is_system} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d] uppercase" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên Vai trò *</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={role && role.is_system} className="w-full border rounded-lg p-2 outline-none focus:border-[#9c513d]">
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

export default RoleModal;
