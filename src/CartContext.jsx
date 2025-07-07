import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // If item with same id and type exists, increase quantity
      const existing = prev.find(
        (i) => i.id === item.id && i.type === item.type
      );
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === item.id && i.type === item.type))
    );
  };

  const clearCart = () => setCartItems([]);

  const replaceCartWithItem = (item) => {
    setCartItems([{ ...item, quantity: 1 }]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, replaceCartWithItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 