import { adminApi } from '../../config/axios.config';

export const getAdminProfile = async () => {
    const response = await adminApi.get('/profile');
    return response.data; // profile.data
};

export const updateAdminProfile = async (formData) => {
    // Send POST with _method=PUT for multipart/form-data
    formData.append('_method', 'PUT');
    
    const response = await adminApi.post('/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response; // returns { message, data }
};

export const changeAdminPassword = async (data) => {
    const response = await adminApi.patch('/profile/password', data);
    return response; // returns { message }
};

export const removeAdminAvatar = async () => {
    const response = await adminApi.delete('/profile/avatar');
    return response; // returns { message, data }
};

export const logoutAllAdminSessions = async () => {
    const response = await adminApi.post('/logout-all');
    return response; // returns { message }
};
