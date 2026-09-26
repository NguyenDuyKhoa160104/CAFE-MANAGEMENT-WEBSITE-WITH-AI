import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerCartContext = createContext(null);

export const CustomerCartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cafeflow_customer_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cafeflow_customer_cart', JSON.stringify(cart));
    }, [cart]);

    const normalizeNote = (note) => (note || '').trim().toLowerCase();

    const addItem = (product, quantity, note = '') => {
        setCart(prevCart => {
            const normalizedNewNote = normalizeNote(note);
            const existingItemIndex = prevCart.findIndex(
                item => item.product_id === product.id && normalizeNote(item.note) === normalizedNewNote
            );

            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                const newQuantity = newCart[existingItemIndex].quantity + quantity;
                if (newQuantity <= product.max_producible_quantity) {
                    newCart[existingItemIndex].quantity = newQuantity;
                } else {
                    newCart[existingItemIndex].quantity = product.max_producible_quantity;
                }
                return newCart;
            } else {
                return [...prevCart, {
                    product_id: product.id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity: Math.min(quantity, product.max_producible_quantity),
                    note: note,
                    max_producible_quantity: product.max_producible_quantity
                }];
            }
        });
    };

    const removeItem = (productId, note) => {
        setCart(prevCart => prevCart.filter(
            item => !(item.product_id === productId && normalizeNote(item.note) === normalizeNote(note))
        ));
    };

    const updateQuantity = (productId, note, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item => {
            if (item.product_id === productId && normalizeNote(item.note) === normalizeNote(note)) {
                return { ...item, quantity: Math.min(newQuantity, item.max_producible_quantity) };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cafeflow_customer_cart');
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CustomerCartContext.Provider value={{ 
            cart, 
            addItem, 
            removeItem, 
            updateQuantity, 
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CustomerCartContext.Provider>
    );
};

export const useCustomerCart = () => useContext(CustomerCartContext);
