import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function useAdminAuth() {
    const navigate = useNavigate();

    const getAuthData = () => {
        const token = localStorage.getItem("admin_token");
        let admin = null;
        try {
            const dataStr = localStorage.getItem("admin_data");
            admin = dataStr ? JSON.parse(dataStr) : null;
        } catch {
            admin = null;
        }
        return { isLoggedIn: Boolean(token), admin };
    };

    const [authState, setAuthState] = useState(getAuthData);

    const checkAuth = useCallback(() => {
        setAuthState(getAuthData());
    }, []);

    useEffect(() => {
        window.addEventListener("admin-auth-changed", checkAuth);
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("admin-auth-changed", checkAuth);
            window.removeEventListener("storage", checkAuth);
        };
    }, [checkAuth]);

    const logout = useCallback(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
        window.dispatchEvent(new Event("admin-auth-changed"));
        navigate("/admin/login", { replace: true });
    }, [navigate]);

    const login = useCallback((token, data) => {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_data", JSON.stringify(data));
        window.dispatchEvent(new Event("admin-auth-changed"));
    }, []);

    return {
        isLoggedIn: authState.isLoggedIn,
        admin: authState.admin,
        logout,
        login
    };
}
