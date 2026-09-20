import axios from "axios";

const createApi = (baseURL, tokenKey) => {
    const api = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(tokenKey);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response.data,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem(tokenKey);
                const actor = tokenKey.split('_')[0];
                window.dispatchEvent(new Event(`${actor}-auth-changed`));
            }

            return Promise.reject(error);
        }
    );

    return api;
};

export const adminApi = createApi(
    import.meta.env.VITE_ADMIN_API_URL,
    "admin_token"
);

export const staffApi = createApi(
    import.meta.env.VITE_STAFF_API_URL,
    "staff_token"
);

export const customerApi = createApi(
    import.meta.env.VITE_CUSTOMER_API_URL,
    "customer_token"
);