import { customerApi } from "../../config/axios.config";

export const customerProfileService = {
    getProfile: () => {
        return customerApi.get("/profile");
    },
    updateProfile: (payload) => {
        return customerApi.put("/profile", payload);
    },
    changePassword: (payload) => {
        return customerApi.patch("/profile/password", payload);
    },
    removeAvatar: () => {
        return customerApi.delete("/profile/avatar");
    },
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return customerApi.post("/profile/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
};
