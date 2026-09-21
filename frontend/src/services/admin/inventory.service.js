import { adminApi } from "../../config/axios.config";

export const inventoryService = {
    // General
    getSummary: async () => {
        return await adminApi.get('/inventory/summary');
    },
    getTransactions: async (params) => {
        return await adminApi.get('/inventory/transactions', { params });
    },
    getLowStock: async (params) => {
        return await adminApi.get('/inventory/low-stock', { params });
    },
    adjustStock: async (data) => {
        return await adminApi.post('/inventory/adjust', data);
    },
    getIngredientDetail: async (id) => {
        return await adminApi.get(`/inventory/detail/${id}`);
    },

    // Ingredients
    getIngredients: async (params) => {
        return await adminApi.get('/inventory/ingredients', { params });
    },
    createIngredient: async (data) => {
        return await adminApi.post('/inventory/ingredients', data);
    },
    getIngredientById: async (id) => {
        return await adminApi.get(`/inventory/ingredients/${id}`);
    },
    updateIngredient: async (id, data) => {
        return await adminApi.put(`/inventory/ingredients/${id}`, data);
    },
    updateIngredientStatus: async (id, status) => {
        return await adminApi.patch(`/inventory/ingredients/${id}/status`, { status });
    },
    deleteIngredient: async (id) => {
        return await adminApi.delete(`/inventory/ingredients/${id}`);
    },

    // Stock Receipts
    getStockReceipts: async (params) => {
        return await adminApi.get('/inventory/receipts', { params });
    },
    createStockReceipt: async (data) => {
        return await adminApi.post('/inventory/receipts', data);
    },
    getStockReceiptById: async (id) => {
        return await adminApi.get(`/inventory/receipts/${id}`);
    },
    updateStockReceipt: async (id, data) => {
        return await adminApi.put(`/inventory/receipts/${id}`, data);
    },
    completeStockReceipt: async (id) => {
        return await adminApi.post(`/inventory/receipts/${id}/complete`);
    },
    cancelStockReceipt: async (id) => {
        return await adminApi.post(`/inventory/receipts/${id}/cancel`);
    },

    // Recipes
    getProductRecipe: async (productId) => {
        return await adminApi.get(`/inventory/recipes/${productId}`);
    },
    updateProductRecipe: async (productId, data) => {
        return await adminApi.put(`/inventory/recipes/${productId}`, data);
    }
};
