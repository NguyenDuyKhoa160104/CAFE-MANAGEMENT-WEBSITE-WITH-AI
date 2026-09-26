import { staffApi } from "../../config/axios.config";

export const staffProfileService = {
    getProfile: () => {
        return staffApi.get("/info");
    },
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return staffApi.post("/profile/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    removeAvatar: () => {
        return staffApi.delete("/profile/avatar");
    }
};
