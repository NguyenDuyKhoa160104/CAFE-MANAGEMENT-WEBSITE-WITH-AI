import { adminApi } from '../../config/axios.config';

// --- AREAS ---
export const getAreas = async (params) => {
    const response = await adminApi.get('/areas', { params });
    return response;
};

export const getArea = async (id) => {
    const response = await adminApi.get(`/areas/${id}`);
    return response;
};

export const createArea = async (data) => {
    const response = await adminApi.post('/areas', data);
    return response;
};

export const updateArea = async (id, data) => {
    const response = await adminApi.put(`/areas/${id}`, data);
    return response;
};

export const deleteArea = async (id) => {
    const response = await adminApi.delete(`/areas/${id}`);
    return response;
};

export const updateAreaStatus = async (id, status) => {
    const response = await adminApi.patch(`/areas/${id}/status`, { status });
    return response;
};


// --- TABLES ---
export const getTables = async (params) => {
    const response = await adminApi.get('/tables', { params });
    return response;
};

export const getTable = async (id) => {
    const response = await adminApi.get(`/tables/${id}`);
    return response;
};

export const createTable = async (data) => {
    const response = await adminApi.post('/tables', data);
    return response;
};

export const updateTable = async (id, data) => {
    const response = await adminApi.put(`/tables/${id}`, data);
    return response;
};

export const deleteTable = async (id) => {
    const response = await adminApi.delete(`/tables/${id}`);
    return response;
};

export const updateTableStatus = async (id, status) => {
    const response = await adminApi.patch(`/tables/${id}/status`, { status });
    return response;
};
