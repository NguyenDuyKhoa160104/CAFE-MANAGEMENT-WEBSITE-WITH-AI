import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function useStaffAuth() {
    const navigate = useNavigate();

    const getAuthData = () => {
        const token = localStorage.getItem("staff_token");
        let staff = null;
        try {
            const dataStr = localStorage.getItem("staff_data");
            staff = dataStr ? JSON.parse(dataStr) : null;
        } catch {
            staff = null;
        }
        return { isLoggedIn: Boolean(token), staff };
    };

    const [authState, setAuthState] = useState(getAuthData);

    const checkAuth = useCallback(() => {
        setAuthState(getAuthData());
    }, []);

    useEffect(() => {
        window.addEventListener("staff-auth-changed", checkAuth);
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("staff-auth-changed", checkAuth);
            window.removeEventListener("storage", checkAuth);
        };
    }, [checkAuth]);

    const logout = useCallback(() => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_data");
        window.dispatchEvent(new Event("staff-auth-changed"));
        navigate("/staff/login", { replace: true });
    }, [navigate]);

    const login = useCallback((token, data) => {
        localStorage.setItem("staff_token", token);
        localStorage.setItem("staff_data", JSON.stringify(data));
        window.dispatchEvent(new Event("staff-auth-changed"));
    }, []);

    return {
        isLoggedIn: authState.isLoggedIn,
        staff: authState.staff,
        logout,
        login
    };
}
