export const getApiErrorMessage = (error) => {
    // Ưu tiên lấy message trực tiếp từ backend gửi về
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Nếu là lỗi validation 422, thử lấy lỗi cụ thể đầu tiên nếu không có message chung
    if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && errors[firstErrorKey]?.[0]) {
            return errors[firstErrorKey][0];
        }
    }

    // Network error hoặc server chết không có response
    if (error.message === "Network Error" || !error.response) {
        return "Không thể kết nối đến máy chủ.";
    }

    // Fallback chung
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
};
