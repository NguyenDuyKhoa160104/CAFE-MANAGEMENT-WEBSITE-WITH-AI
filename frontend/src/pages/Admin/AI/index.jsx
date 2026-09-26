import React, { useState, useEffect } from 'react';
import { adminAIService } from '../../../services/admin/ai.service';
import { Bot, Settings, BookOpen, MessageSquare, Save, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const AIAdmin = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Bot /> Quản lý Trợ lý AI
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview' ? 'border-[#604238] text-[#604238]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Bot size={18} /> Tổng quan
                </button>
                <button
                    className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'border-[#604238] text-[#604238]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={18} /> Cấu hình
                </button>
                <button
                    className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'knowledge' ? 'border-[#604238] text-[#604238]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('knowledge')}
                >
                    <BookOpen size={18} /> Knowledge Base
                </button>
                <button
                    className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'border-[#604238] text-[#604238]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    <MessageSquare size={18} /> Lịch sử Chat
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'knowledge' && <KnowledgeTab />}
                {activeTab === 'history' && <HistoryTab />}
            </div>
        </div>
    );
};

const OverviewTab = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        adminAIService.getOverview().then(res => setStats(res.data)).catch((e) => { console.error('Overview error', e); toast.error('Lỗi tải thống kê'); });
    }, []);

    if (!stats) return <div>Đang tải...</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Tổng quan AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                    <p className="text-sm">Tổng hội thoại</p>
                    <p className="text-2xl font-bold">{stats.total_conversations}</p>
                </div>
                <div className="p-4 bg-green-50 text-green-800 rounded-lg">
                    <p className="text-sm">Tin nhắn Customer</p>
                    <p className="text-2xl font-bold">{stats.total_user_messages} / {stats.total_messages}</p>
                </div>
                <div className="p-4 bg-orange-50 text-orange-800 rounded-lg">
                    <p className="text-sm">Không hiểu (Fallback)</p>
                    <p className="text-2xl font-bold">{stats.fallback_count}</p>
                </div>
                <div className="p-4 bg-gray-50 text-gray-800 rounded-lg">
                    <p className="text-sm">Khách hàng tương tác</p>
                    <p className="text-2xl font-bold">{stats.total_customers}</p>
                </div>
            </div>
            
            <h3 className="text-lg font-bold mb-3">Top câu hỏi (Intents)</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
                {stats.top_intents?.length > 0 ? (
                    <ul className="space-y-2">
                        {stats.top_intents.map((item, i) => (
                            <li key={i} className="flex justify-between border-b pb-2">
                                <span className="font-medium text-gray-700">{item.intent}</span>
                                <span className="bg-gray-200 px-2 py-1 rounded text-sm">{item.count} lượt</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Chưa có dữ liệu</p>
                )}
            </div>
        </div>
    );
};

const SettingsTab = () => {
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminAIService.getSettings().then(res => setSettings(res.data)).catch(() => toast.error('Lỗi tải cấu hình'));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAIService.updateSettings(settings);
            toast.success('Cập nhật cấu hình thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (!settings) return <div>Đang tải...</div>;

    return (
        <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Cấu hình hệ thống AI</h2>
            
            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <input 
                        type="checkbox" 
                        id="enabled" 
                        name="enabled" 
                        checked={settings.enabled} 
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#604238]"
                    />
                    <label htmlFor="enabled" className="font-medium">Bật Chatbot AI</label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên trợ lý</label>
                    <input type="text" name="assistant_name" value={settings.assistant_name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lời chào (Welcome Message)</label>
                    <textarea name="welcome_message" value={settings.welcome_message || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2" rows={3}></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn mặc định khi không hiểu (Fallback Message)</label>
                    <textarea name="fallback_message" value={settings.fallback_message || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2" rows={2}></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thông báo bảo trì</label>
                    <input type="text" name="maintenance_message" value={settings.maintenance_message || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn tin nhắn/ngày (User)</label>
                        <input type="number" name="daily_message_limit" value={settings.daily_message_limit} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider hiện tại</label>
                        <input type="text" value={settings.provider} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-100" />
                        <span className="text-xs text-gray-500">Chỉ dùng MOCK trong Phase 1.</span>
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} disabled={saving} className="bg-[#604238] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4a332b]">
                        <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const KnowledgeTab = () => {
    const [entries, setEntries] = useState([]);
    
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        adminAIService.getKnowledge().then(res => setEntries(res.data)).catch(console.error);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Knowledge Base (Kiến thức AI)</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {entries.map(e => (
                    <div key={e.id} className="border rounded-lg p-4 hover:shadow-sm">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-bold text-lg">{e.title}</h3>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded uppercase">{e.category}</span>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{e.content}</p>
                    </div>
                ))}
                {entries.length === 0 && <p className="text-gray-500">Chưa có dữ liệu.</p>}
            </div>
        </div>
    );
};

const HistoryTab = () => {
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
        adminAIService.getConversations().then(res => setConversations(res.data?.data || [])).catch(console.error);
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-6">Lịch sử hội thoại gần đây</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-3">Mã phiên</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Số tin nhắn</th>
                            <th className="p-3">Cập nhật cuối</th>
                            <th className="p-3">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conversations.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{c.conversation_code}</td>
                                <td className="p-3">{c.customer ? c.customer.full_name : 'Guest'}</td>
                                <td className="p-3">{c.messages_count}</td>
                                <td className="p-3">{new Date(c.last_message_at).toLocaleString('vi-VN')}</td>
                                <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{c.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {conversations.length === 0 && <p className="text-center p-4 text-gray-500">Chưa có lịch sử trò chuyện.</p>}
            </div>
        </div>
    );
};

export default AIAdmin;
