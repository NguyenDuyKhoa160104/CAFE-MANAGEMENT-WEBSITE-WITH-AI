import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuthService } from '../services/customer/auth.service';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('customer_token');
            if (token) {
                try {
                    const response = await customerAuthService.getInfo();
                    setCustomer(response.customer);
                    setIsAuthenticated(true);
                    localStorage.setItem('customer_data', JSON.stringify(response.customer));
                } catch (error) {
                    console.error('Failed to verify customer token:', error);
                    logoutCustomer();
                }
            }
            setIsInitializing(false);
        };

        initializeAuth();

        const handleAuthChanged = () => {
            if (!localStorage.getItem('customer_token')) {
                setCustomer(null);
                setIsAuthenticated(false);
            }
        };

        window.addEventListener('customer-auth-changed', handleAuthChanged);
        return () => window.removeEventListener('customer-auth-changed', handleAuthChanged);
    }, []);

    const loginCustomer = (data, token) => {
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_data', JSON.stringify(data));
        setCustomer(data);
        setIsAuthenticated(true);
    };

    const logoutCustomer = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
        setCustomer(null);
        setIsAuthenticated(false);
    };

    const updateCustomerProfile = (data) => {
        setCustomer(data);
        localStorage.setItem('customer_data', JSON.stringify(data));
    };

    return (
        <CustomerAuthContext.Provider value={{ 
            customer, 
            isAuthenticated, 
            isInitializing, 
            loginCustomer, 
            logoutCustomer,
            updateCustomerProfile 
        }}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
