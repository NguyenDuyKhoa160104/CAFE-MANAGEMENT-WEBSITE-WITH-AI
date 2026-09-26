import React, { useState, useEffect } from 'react';
import { hrApi } from '../../../../services/api/admin/hrApi';
import { toast } from 'react-hot-toast';
import { X, Check } from 'lucide-react';

const PermissionModal = ({ role, allPermissions, onClose, onSuccess }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role && role.permissions) {
            setSelectedIds(role.permissions.map(p => p.id));
        }
    }, [role]);

    const handleToggle = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleToggleModule = (moduleKey) => {
        const modulePerms = allPermissions[moduleKey].map(p => p.id);
        const allSelected = modulePerms.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !modulePerms.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...modulePerms])]);
        }
    };

    const handleSelectAll = () => {
        const allIds = Object.values(allPermissions).flat().map(p => p.id);
        setSelectedIds(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await hrApi.updateRolePermissions(role.id, selectedIds);
            toast.success('Phân quyền thành công');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi phân quyền');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="font-bold text-lg">Phân quyền: {role?.name}</h3>
                        <p className="text-sm text-gray-500">Mã: {role?.role_code}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                
                <div className="flex gap-2 p-4 bg-gray-50 border-b">
                    <button type="button" onClick={handleSelectAll} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-100">Chọn tất cả</button>
                    <button type="button" onClick={handleDeselectAll} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-100">Bỏ chọn tất cả</button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(allPermissions).map(([moduleName, perms]) => {
                            const isAllSelected = perms.every(p => selectedIds.includes(p.id));
                            return (
                                <div key={moduleName} className="border rounded-lg overflow-hidden">
                                    <div 
                                        className="bg-gray-100 px-4 py-2 font-semibold flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                                        onClick={() => handleToggleModule(moduleName)}
                                    >
                                        <span>{moduleName}</span>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${isAllSelected ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                                            {isAllSelected && <Check size={14} />}
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {perms.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    checked={selectedIds.includes(p.id)}
                                                    onChange={() => handleToggle(p.id)}
                                                />
                                                <span className="text-sm">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t bg-white">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                        {loading ? 'Đang lưu...' : 'Lưu quyền'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;
