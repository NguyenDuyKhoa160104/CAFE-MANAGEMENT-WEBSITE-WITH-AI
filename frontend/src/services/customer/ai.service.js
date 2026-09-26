import { customerApi } from '../../config/axios.config';

export const customerAIService = {
    getConfig: () => {
        return customerApi.get('/ai/config');
    },
    
    chat: (payload) => {
        // payload: { message: string, session_key: string }
        return customerApi.post('/ai/chat', payload);
    }
};
