import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, Send, X, RotateCcw, Minimize2 } from 'lucide-react';
import { customerAIService } from '../../../services/customer/ai.service';
import { useNavigate } from 'react-router-dom';

const AIChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [config, setConfig] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Session Key
    const getSessionKey = () => {
        let key = localStorage.getItem('cafeflow_ai_session_key');
        if (!key) {
            key = 'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('cafeflow_ai_session_key', key);
        }
        return key;
    };

    useEffect(() => {
        fetchConfig();
        const savedMessages = localStorage.getItem('cafeflow_ai_messages');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Error parsing saved messages", e);
            }
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (messages.length > 0) {
            localStorage.setItem('cafeflow_ai_messages', JSON.stringify(messages.slice(-20))); // save last 20
        }
    }, [messages]);

    const fetchConfig = async () => {
        try {
            const res = await customerAIService.getConfig();
            const cfg = res.data?.data || res.data;
            setConfig(cfg);
            if (messages.length === 0 && cfg?.welcome_message) {
                setMessages([{ role: 'ASSISTANT', content: cfg.welcome_message }]);
            }
        } catch (error) {
            console.error('Failed to fetch AI config', error);
        }
    };

    const handleSend = async (textToSend = input) => {
        const text = textToSend.trim();
        if (!text || isTyping) return;

        const newMessages = [...messages, { role: 'USER', content: text }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const res = await customerAIService.chat({
                message: text,
                session_key: getSessionKey()
            });
            const replyData = res.data?.data || res.data;
            
            setMessages([...newMessages, { 
                role: 'ASSISTANT', 
                content: replyData.reply,
                metadata: replyData.metadata
            }]);
        } catch (error) {
            console.error('Chat error', error);
            const errData = error.response?.data?.data;
            setMessages([...newMessages, { 
                role: 'ASSISTANT', 
                content: errData?.reply || 'Có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.' 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        const initialMsg = config?.welcome_message ? [{ role: 'ASSISTANT', content: config.welcome_message }] : [];
        setMessages(initialMsg);
        localStorage.removeItem('cafeflow_ai_messages');
    };

    const handleAction = (metadata) => {
        if (metadata?.route) {
            navigate(metadata.route);
            setIsOpen(false);
        }
    };

    if (!config || (!config.enabled && !isOpen)) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                className="fixed bottom-6 right-6 p-4 bg-[#604238] text-white rounded-full shadow-2xl hover:bg-[#4a332b] transition-all transform hover:scale-105 z-50 flex items-center justify-center"
            >
                <Bot size={28} />
            </button>
        );
    }

    return (
        <div className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100%-2rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-[#E9DFD8] transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px] max-h-[80vh]'}`}>
            {/* Header */}
            <div className="bg-[#604238] text-white p-4 flex items-center justify-between shadow-md z-10 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm leading-tight">{config.assistant_name || 'CafeFlow Assistant'}</h3>
                        <p className="text-xs text-white/70">{config.enabled ? 'Sẵn sàng hỗ trợ' : 'Đang bảo trì'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="p-1 hover:bg-white/20 rounded-full transition-colors" title="Bắt đầu lại">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        {isMinimized ? <MessageCircle size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 bg-[#F7F4F1] flex flex-col gap-4">
                        {!config.enabled ? (
                            <div className="text-center p-4 bg-white rounded-xl text-[#958981] border border-[#E9DFD8]">
                                {config.maintenance_message}
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.role === 'USER' ? 'bg-[#604238] text-white rounded-br-none' : 'bg-white text-[#302723] border border-[#E9DFD8] rounded-bl-none'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            
                                            {msg.metadata?.action && (
                                                <button
                                                    onClick={() => handleAction(msg.metadata)}
                                                    className="mt-3 w-full py-1.5 px-3 bg-[#F7F4F1] text-[#604238] text-xs font-semibold rounded-lg border border-[#E9DFD8] hover:bg-[#E9DFD8] transition-colors"
                                                >
                                                    Thực hiện
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-[#E9DFD8] rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-[#958981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-[#958981] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-[#958981] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                
                                {messages.length === 1 && config.suggested_questions?.length > 0 && !isTyping && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {config.suggested_questions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q)}
                                                className="text-xs bg-white border border-[#E9DFD8] text-[#604238] px-3 py-1.5 rounded-full hover:bg-[#E9DFD8] transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-white border-t border-[#E9DFD8]">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2 bg-[#F7F4F1] p-1 rounded-full border border-[#E9DFD8] focus-within:border-[#604238] transition-colors"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={!config.enabled || isTyping}
                                placeholder={config.enabled ? "Hỏi gì đó..." : "Tạm ngưng phục vụ"}
                                className="flex-1 bg-transparent border-none focus:outline-none px-4 text-sm text-[#302723]"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || !config.enabled || isTyping}
                                className="p-2 bg-[#604238] text-white rounded-full hover:bg-[#4a332b] disabled:bg-[#958981] transition-colors flex items-center justify-center"
                            >
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChatBubble;
