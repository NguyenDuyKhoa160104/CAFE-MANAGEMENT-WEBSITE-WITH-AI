import { staffApi } from "../../config/axios.config";

const BASE_URL = "/promotions";

export const staffPromotionService = {
    preview: async (data) => {
        return await staffApi.post(`${BASE_URL}/preview`, data);
    }
};
