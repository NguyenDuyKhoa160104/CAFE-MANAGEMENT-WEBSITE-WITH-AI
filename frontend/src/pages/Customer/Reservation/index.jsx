import React, { useState, useEffect } from 'react';
import { customerReservationService } from '../../../services/customer/reservation.service';
import { useCustomerAuth } from '../../../contexts/CustomerAuthContext';
import { showSuccess, showError } from '../../../utils/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { CalendarDays, Clock, Users, ArrowRight, X, CalendarCheck, UtensilsCrossed } from 'lucide-react';


const Reservation = () => {
    const [step, setStep] = useState(1);
    const [reservationAt, setReservationAt] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [durationMinutes, setDurationMinutes] = useState(120);
    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    
    // My Reservations
    const [myReservations, setMyReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

    const { customer } = useCustomerAuth();

    const fetchMyReservations = async () => {
        setLoadingReservations(true);
        try {
            const response = await customerReservationService.getReservations();
            setMyReservations(response.data || response || []);
        } catch (error) {
            console.error("Failed to load reservations", error);
        } finally {
            setLoadingReservations(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchMyReservations();
        }
    }, [activeTab]);

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        
        if (new Date(reservationAt) <= new Date()) {
            showError("Vui lòng chọn thời gian trong tương lai.");
            return;
        }

        setLoading(true);
        try {
            // Convert to local datetime format expected by backend (Y-m-d H:i)
            // Manual format instead of using date-fns
            const dateObj = new Date(reservationAt);
            const pad = (n) => n.toString().padStart(2, '0');
            const formattedDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;

            const response = await customerReservationService.getAvailableTables({
                reservation_at: formattedDate,
                party_size: partySize,
                duration_minutes: durationMinutes
            });
            const tables = response.data || response || [];
            setAvailableTables(tables);
            
            if (tables.length === 0) {
                showError("Không có bàn trống phù hợp vào thời gian này.");
            } else {
                setStep(2);
            }
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi kiểm tra bàn trống");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReservation = async () => {
        if (!selectedTable) {
            showError("Vui lòng chọn bàn");
            return;
        }

        setLoading(true);
        try {
            const dateObj = new Date(reservationAt);
            const pad = (n) => n.toString().padStart(2, '0');
            const formattedDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;

            const payload = {
                table_id: selectedTable.id,
                reservation_at: formattedDate,
                party_size: partySize,
                duration_minutes: durationMinutes,
                note: note
            };

            await customerReservationService.createReservation(payload);
            showSuccess("Yêu cầu đặt bàn đã được gửi và đang chờ quán xác nhận.");
            
            // Reset and switch to history
            setStep(1);
            setReservationAt('');
            setPartySize(2);
            setSelectedTable(null);
            setNote('');
            setActiveTab('history');
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi đặt bàn");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch đặt bàn này?")) return;
        
        try {
            await customerReservationService.cancelReservation(id);
            showSuccess("Đã hủy đặt bàn");
            fetchMyReservations();
        } catch (error) {
            showError(getApiErrorMessage(error) || "Lỗi khi hủy đặt bàn");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Chờ xác nhận</span>;
            case 'CONFIRMED': return <span className="px-3 py-1 bg-[#EEF4E5] text-[#6F8F3D] rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Đã xác nhận</span>;
            case 'CHECKED_IN': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Đã nhận bàn</span>;
            case 'COMPLETED': return <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Hoàn tất</span>;
            case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Đã hủy</span>;
            case 'NO_SHOW': return <span className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Không đến</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{status}</span>;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())} - ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    return (
        <div className="bg-[#F7F4F1] min-h-[calc(100vh-64px)] pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#302723] mb-4">Đặt Bàn</h1>
                    <p className="text-[#958981] max-w-2xl mx-auto">Chọn không gian ưa thích và tận hưởng những khoảnh khắc tuyệt vời cùng người thân, bạn bè tại CafeFlow.</p>
                </div>
                
                <div className="flex justify-center mb-12">
                    <div className="bg-white rounded-full p-1.5 shadow-sm border border-[#E9DFD8] inline-flex">
                        <button 
                            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-[#604238] text-white shadow-md' : 'text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}
                            onClick={() => setActiveTab('new')}
                        >
                            <CalendarDays size={18} /> Đặt bàn mới
                        </button>
                        <button 
                            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-[#604238] text-white shadow-md' : 'text-[#958981] hover:bg-[#F7F4F1] hover:text-[#604238]'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <CalendarCheck size={18} /> Lịch đặt của tôi
                        </button>
                    </div>
                </div>

                {activeTab === 'new' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-[#E9DFD8] overflow-hidden">
                        {/* Step indicator */}
                        <div className="flex border-b border-[#E9DFD8] bg-[#F7F4F1]/50">
                            <div className={`flex-1 text-center py-5 transition-colors ${step === 1 ? 'text-[#604238] border-b-2 border-[#604238] bg-white font-bold' : 'text-[#958981] font-medium'}`}>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 mr-2 text-xs border-current">1</span>
                                Chọn thời gian
                            </div>
                            <div className={`flex-1 text-center py-5 transition-colors ${step === 2 ? 'text-[#604238] border-b-2 border-[#604238] bg-white font-bold' : 'text-[#958981] font-medium'}`}>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 mr-2 text-xs border-current">2</span>
                                Chọn bàn & Xác nhận
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            {step === 1 && (
                                <form onSubmit={handleCheckAvailability} className="max-w-md mx-auto space-y-8">
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <label className="block text-sm font-bold text-[#302723] mb-2 uppercase tracking-wide">Thời gian đến</label>
                                            <div className="relative">
                                                <input 
                                                    type="datetime-local" 
                                                    required
                                                    value={reservationAt}
                                                    onChange={(e) => setReservationAt(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E9DFD8] bg-[#F7F4F1] focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                />
                                                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <label className="block text-sm font-bold text-[#302723] mb-2 uppercase tracking-wide">Số lượng khách</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    required
                                                    value={partySize}
                                                    onChange={(e) => setPartySize(parseInt(e.target.value))}
                                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E9DFD8] bg-[#F7F4F1] focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all font-medium text-[#302723]"
                                                />
                                                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#958981]" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={loading || !reservationAt}
                                        className="w-full bg-[#604238] hover:bg-[#4a332b] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                                    >
                                        {loading ? (
                                            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div> Đang kiểm tra...</>
                                        ) : (
                                            <>Tìm bàn trống <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="bg-[#F7F4F1] p-4 rounded-2xl mb-8 flex flex-wrap gap-6 items-center justify-center text-sm font-medium text-[#604238] border border-[#E9DFD8]/50">
                                        <span className="flex items-center gap-2"><Clock size={16} /> {formatDateTime(reservationAt)}</span>
                                        <span className="flex items-center gap-2"><Users size={16} /> {partySize} khách</span>
                                    </div>
                                    
                                    <h3 className="font-bold text-xl text-[#302723] mb-6 text-center">Chọn vị trí ngồi</h3>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                        {availableTables.map(table => (
                                            <div 
                                                key={table.id}
                                                onClick={() => setSelectedTable(table)}
                                                className={`cursor-pointer border-2 rounded-2xl p-6 text-center transition-all transform hover:-translate-y-1 ${
                                                    selectedTable?.id === table.id 
                                                        ? 'border-[#604238] bg-[#604238] text-white shadow-lg' 
                                                        : 'border-[#E9DFD8] bg-white hover:border-[#604238]/50 hover:shadow-md'
                                                }`}
                                            >
                                                <UtensilsCrossed className={`mx-auto w-8 h-8 mb-3 ${selectedTable?.id === table.id ? 'text-white' : 'text-[#958981]'}`} />
                                                <div className={`font-bold text-lg mb-1 ${selectedTable?.id === table.id ? 'text-white' : 'text-[#302723]'}`}>{table.name}</div>
                                                <div className={`text-xs ${selectedTable?.id === table.id ? 'text-white/80' : 'text-[#958981]'}`}>Tối đa {table.capacity} khách</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-10">
                                        <label className="block text-sm font-bold text-[#302723] mb-2 uppercase tracking-wide">Ghi chú (Tùy chọn)</label>
                                        <textarea 
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9DFD8] bg-[#F7F4F1] focus:bg-white focus:ring-2 focus:ring-[#604238]/20 focus:border-[#604238] transition-all resize-none"
                                            rows="3"
                                            placeholder="Ghi chú yêu cầu đặc biệt của bạn (ví dụ: ghế trẻ em, dị ứng...)"
                                        ></textarea>
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row gap-4">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="flex-1 border-2 border-[#E9DFD8] hover:border-[#958981] hover:bg-[#F7F4F1] text-[#302723] py-4 rounded-xl font-bold transition-all"
                                        >
                                            Quay lại
                                        </button>
                                        <button 
                                            onClick={handleCreateReservation}
                                            disabled={loading || !selectedTable}
                                            className="flex-[2] bg-[#604238] hover:bg-[#4a332b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center"
                                        >
                                            {loading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-[#E9DFD8] p-8">
                        <h2 className="text-2xl font-bold text-[#302723] mb-8">Lịch sử đặt bàn</h2>
                        
                        {loadingReservations ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E9DFD8] border-t-[#604238]"></div></div>
                        ) : myReservations.length > 0 ? (
                            <div className="space-y-6">
                                {myReservations.map(res => (
                                    <div key={res.id} className="border border-[#E9DFD8] bg-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all">
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center space-x-3 mb-4 border-b border-[#E9DFD8] pb-4">
                                                <span className="font-black text-[#302723] text-lg bg-[#F7F4F1] px-3 py-1 rounded-lg tracking-wider">#{res.reservation_code}</span>
                                                {getStatusBadge(res.status)}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238]"><Clock size={18} /></div>
                                                    <div>
                                                        <p className="text-[#958981] text-xs uppercase tracking-wider font-bold mb-0.5">Thời gian</p>
                                                        <p className="font-semibold text-[#302723]">{formatDateTime(res.reservation_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238]"><UtensilsCrossed size={18} /></div>
                                                    <div>
                                                        <p className="text-[#958981] text-xs uppercase tracking-wider font-bold mb-0.5">Bàn</p>
                                                        <p className="font-semibold text-[#302723]">{res.table?.name || 'Đang xếp bàn'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238]"><Users size={18} /></div>
                                                    <div>
                                                        <p className="text-[#958981] text-xs uppercase tracking-wider font-bold mb-0.5">Khách</p>
                                                        <p className="font-semibold text-[#302723]">{res.party_size} người</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#F7F4F1] flex items-center justify-center text-[#604238]"><CalendarDays size={18} /></div>
                                                    <div>
                                                        <p className="text-[#958981] text-xs uppercase tracking-wider font-bold mb-0.5">Ngày tạo</p>
                                                        <p className="font-semibold text-[#302723]">{formatDateTime(res.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {res.note && (
                                                <div className="mt-4 pt-4 border-t border-[#E9DFD8] text-sm">
                                                    <span className="font-bold text-[#302723]">Ghi chú:</span> <span className="text-[#6d625d] italic">{res.note}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="w-full md:w-auto flex justify-end">
                                            {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                                                <button 
                                                    onClick={() => handleCancelReservation(res.id)}
                                                    className="w-full md:w-auto px-6 py-3 border-2 border-red-500/20 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X size={16} /> Hủy đặt bàn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#F7F4F1] rounded-2xl border border-[#E9DFD8] border-dashed">
                                <div className="mb-4 flex justify-center text-[#958981]"><CalendarDays size={64} /></div>
                                <h3 className="text-xl font-bold text-[#302723] mb-2">Chưa có lịch sử</h3>
                                <p className="text-[#958981]">Bạn chưa thực hiện đặt bàn nào. Hãy trải nghiệm dịch vụ của chúng tôi nhé!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reservation;
