import React, { useState, useEffect } from "react";
import { BadgePercent, Plus, Pencil, Trash2, Search, Filter, Gift, X } from "lucide-react";
import { promotionService } from "../../../services/admin/promotion.service";
import adminCustomerVoucherService from "../../../services/admin/customerVoucher.service";
import { customerService } from "../../../services/admin/customer.service";
import { showSuccess, showError } from "../../../utils/toast";

const PromotionsManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("PROMOTIONS");
    const [assignedVouchers, setAssignedVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    
    // Assign Voucher State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [assignNote, setAssignNote] = useState("");
    const [assigning, setAssigning] = useState(false);

    const fetchVouchers = async () => {
        try {
            setLoadingVouchers(true);
            const res = await adminCustomerVoucherService.getVouchers();
            setAssignedVouchers(res.data?.data?.data || res.data?.data || []);
        } catch (error) {
            console.error("Lỗi tải voucher", error);
        } finally {
            setLoadingVouchers(false);
        }
    };

    useEffect(() => {
        if (activeTab === "VOUCHERS") {
            fetchVouchers();
        }
    }, [activeTab]);

    const fetchCustomers = async () => {
        try {
            const res = await customerService.getAll({ per_page: 100 });
            setCustomers(res.data?.data?.data || res.data?.data || []);
        } catch (error) {
            console.error("Lỗi tải khách hàng", error);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedCustomerId) {
            showError("Vui lòng chọn khách hàng");
            return;
        }
        setAssigning(true);
        try {
            await adminCustomerVoucherService.assignVoucher({
                customer_id: selectedCustomerId,
                promotion_id: selectedPromo.id,
                note: assignNote
            });
            showSuccess("Tặng voucher thành công!");
            setShowAssignModal(false);
            setAssignNote("");
            setSelectedCustomerId("");
            if (activeTab === "VOUCHERS") fetchVouchers();
        } catch (error) {
            showError(error.response?.data?.message || "Lỗi khi tặng voucher");
        } finally {
            setAssigning(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm("Bạn có chắc muốn thu hồi voucher này?")) return;
        try {
            await adminCustomerVoucherService.revokeVoucher(id);
            showSuccess("Thu hồi thành công");
            fetchVouchers();
        } catch (error) {
            showError(error.response?.data?.message || "Lỗi khi thu hồi");
        }
    };

    function getInitialForm() {
        return {
            name: "",
            promotion_code: "",
            description: "",
            application_mode: "AUTO",
            discount_type: "PERCENTAGE",
            scope: "ORDER",
            discount_value: "",
            max_discount_amount: "",
            min_order_amount: "",
            starts_at: "",
            ends_at: "",
            usage_limit: "",
            status: "ACTIVE"
        };
    }

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionService.getAll({ search });
            setPromotions(res.data?.data?.data || res.data?.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, [search]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await promotionService.update(formData.id, formData);
            } else {
                await promotionService.create(formData);
            }
            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra: " + (error.response?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
        try {
            await promotionService.delete(id);
            fetchPromotions();
        } catch (error) {
            alert(error.response?.data?.message || "Không thể xóa");
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

    return (
        <div className="space-y-5 p-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#302723]">Quản lý khuyến mãi</h1>
                    <p className="mt-1 text-xs text-[#958981]">Quản lý các chương trình giảm giá và ví voucher khách hàng.</p>
                </div>
                {activeTab === "PROMOTIONS" && (
                    <button
                        onClick={() => { setFormData(getInitialForm()); setIsEditing(false); setShowModal(true); }}
                        className="flex h-10 items-center gap-2 rounded-lg bg-[#604238] px-4 text-xs font-semibold text-white hover:bg-[#4a322a]"
                    >
                        <Plus size={15} /> Thêm khuyến mãi
                    </button>
                )}
            </div>
            
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab("PROMOTIONS")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "PROMOTIONS" ? 'border-b-2 border-[#8e7d5f] text-[#8e7d5f]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Danh sách khuyến mãi
                </button>
                <button 
                    onClick={() => setActiveTab("VOUCHERS")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "VOUCHERS" ? 'border-b-2 border-[#8e7d5f] text-[#8e7d5f]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Quản lý Voucher đã tặng
                </button>
            </div>
            
            {activeTab === "PROMOTIONS" && (
                <>
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm mã, tên khuyến mãi..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Mã</th>
                                    <th className="px-4 py-3 font-semibold">Tên</th>
                                    <th className="px-4 py-3 font-semibold">Hình thức</th>
                                    <th className="px-4 py-3 font-semibold">Giá trị</th>
                                    <th className="px-4 py-3 font-semibold">Thời gian</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                    <tbody className="divide-y">
                        {promotions.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{p.promotion_code}</td>
                                <td className="px-4 py-3">{p.name}</td>
                                <td className="px-4 py-3">{p.application_mode === 'AUTO' ? 'Tự động' : 'Mã giảm'}</td>
                                <td className="px-4 py-3">
                                    {p.discount_type === 'PERCENTAGE' ? `${p.discount_value}%` : formatMoney(p.discount_value)}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    {new Date(p.starts_at).toLocaleDateString('vi-VN')} - {new Date(p.ends_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {p.application_mode === 'CODE' && p.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => { setSelectedPromo(p); setShowAssignModal(true); fetchCustomers(); }}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded mr-2"
                                            title="Tặng voucher cho khách"
                                        >
                                            <Gift size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setFormData(p); setIsEditing(true); setShowModal(true); }}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && (
                            <tr><td colSpan="7" className="text-center py-4 text-gray-500">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            </>
            )}

            {activeTab === "VOUCHERS" && (
                <div className="bg-white rounded-lg border overflow-x-auto">
                    {loadingVouchers ? (
                        <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Khách hàng</th>
                                    <th className="px-4 py-3 font-semibold">Mã KM</th>
                                    <th className="px-4 py-3 font-semibold">Mã Voucher</th>
                                    <th className="px-4 py-3 font-semibold">Ngày tặng</th>
                                    <th className="px-4 py-3 font-semibold">Ngày hết hạn</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {assignedVouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{v.customer?.full_name}</div>
                                            <div className="text-xs text-gray-500">{v.customer?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#8e7d5f]">{v.promotion?.promotion_code}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{v.voucher_code}</td>
                                        <td className="px-4 py-3 text-xs">{new Date(v.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-4 py-3 text-xs">{v.expires_at ? new Date(v.expires_at).toLocaleDateString('vi-VN') : 'Không thời hạn'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${v.status === 'UNUSED' ? 'bg-green-100 text-green-700' : 
                                                  v.status === 'USED' ? 'bg-gray-100 text-gray-700' :
                                                  v.status === 'RESERVED' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {v.status === 'UNUSED' && (
                                                <button
                                                    onClick={() => handleRevoke(v.id)}
                                                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                                                >
                                                    Thu hồi
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {assignedVouchers.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">Chưa có voucher nào được tặng</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mt-10 mb-10 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mã khuyến mãi *</label>
                                    <input required type="text" className="w-full border rounded p-2 text-sm" value={formData.promotion_code} onChange={e => setFormData({ ...formData, promotion_code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tên chương trình *</label>
                                    <input required type="text" className="w-full border rounded p-2 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hình thức</label>
                                    <select className="w-full border rounded p-2 text-sm" value={formData.application_mode} onChange={e => setFormData({ ...formData, application_mode: e.target.value })}>
                                        <option value="AUTO">Tự động</option>
                                        <option value="CODE">Mã giảm giá</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại giảm</label>
                                    <select className="w-full border rounded p-2 text-sm" value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })}>
                                        <option value="PERCENTAGE">Phần trăm</option>
                                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phạm vi</label>
                                    <select className="w-full border rounded p-2 text-sm" value={formData.scope} onChange={e => setFormData({ ...formData, scope: e.target.value })}>
                                        <option value="ORDER">Toàn đơn hàng</option>
                                        {/* Categories and Products selection ignored in simplified UI, backend supports it */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giá trị giảm *</label>
                                    <input required type="number" className="w-full border rounded p-2 text-sm" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đơn tối thiểu (VNĐ)</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.min_order_amount} onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giảm tối đa (VNĐ)</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.max_discount_amount} onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
                                    <input required type="datetime-local" className="w-full border rounded p-2 text-sm" value={formData.starts_at?.slice(0, 16)} onChange={e => setFormData({ ...formData, starts_at: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ngày kết thúc *</label>
                                    <input required type="datetime-local" className="w-full border rounded p-2 text-sm" value={formData.ends_at?.slice(0, 16)} onChange={e => setFormData({ ...formData, ends_at: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giới hạn số lần dùng</label>
                                    <input type="number" className="w-full border rounded p-2 text-sm" value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                    <select className="w-full border rounded p-2 text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="ACTIVE">Kích hoạt</option>
                                        <option value="INACTIVE">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm bg-gray-50 hover:bg-gray-100">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-[#604238] text-white rounded text-sm hover:bg-[#4a322a]">Lưu khuyến mãi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Voucher Modal */}
            {showAssignModal && selectedPromo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Gift size={20} className="text-[#8e7d5f]" /> Tặng Voucher
                            </h2>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-4 p-3 bg-[#8e7d5f]/10 rounded-lg">
                            <h3 className="font-bold text-[#8e7d5f] text-sm">{selectedPromo.name}</h3>
                            <p className="text-xs text-gray-600 mt-1">Mã: {selectedPromo.promotion_code}</p>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Chọn Khách hàng *</label>
                                <select 
                                    required 
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#8e7d5f]" 
                                    value={selectedCustomerId} 
                                    onChange={e => setSelectedCustomerId(e.target.value)}
                                >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.phone || c.email})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Ghi chú (Tùy chọn)</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#8e7d5f]" 
                                    placeholder="Lý do tặng..."
                                    value={assignNote} 
                                    onChange={e => setAssignNote(e.target.value)} 
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg text-sm bg-gray-50 hover:bg-gray-100">Hủy</button>
                                <button type="submit" disabled={assigning} className="px-4 py-2 bg-[#8e7d5f] text-white rounded-lg text-sm hover:bg-[#7a6a4f] disabled:opacity-50">
                                    {assigning ? "Đang tặng..." : "Xác nhận tặng"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionsManagement;
