import { customerApi } from "../../config/axios.config";

const BASE_URL = "/promotions";

export const customerPromotionService = {
    getActive: async () => {
        return await customerApi.get(`${BASE_URL}/active`);
    },

    preview: async (data) => {
        return await customerApi.post(`${BASE_URL}/preview`, data);
    }
};
