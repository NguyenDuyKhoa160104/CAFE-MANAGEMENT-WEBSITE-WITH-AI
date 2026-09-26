import { customerApi } from "../../config/axios.config";

export const customerAuthService = {
    register: (payload) => {
        return customerApi.post("/register", payload);
    },
    login: (payload) => {
        return customerApi.post("/login", payload);
    },
    getInfo: () => {
        return customerApi.get("/info");
    },
    logout: () => {
        return customerApi.post("/logout");
    },
    logoutAll: () => {
        return customerApi.post("/logout-all");
    },
};
