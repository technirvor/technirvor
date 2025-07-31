"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ComboProduct } from "./types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  addComboItem: (combo: ComboProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.product.id === product.id && !item.isCombo,
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id && !item.isCombo
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          set({
            items: [...items, { id: product.id, product, quantity }],
          });
        }
      },
      addComboItem: (combo, quantity = 1) => {
        const items = get().items;
        const existingCombo = items.find(
          (item) => item.comboId === combo.id && item.isCombo,
        );

        if (existingCombo) {
          set({
            items: items.map((item) =>
              item.comboId === combo.id && item.isCombo
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          // Create a virtual product for the combo
          const comboAsProduct: Product = {
            id: combo.id,
            name: combo.name,
            slug: combo.slug,
            description: combo.description,
            price: combo.combo_price,
            sale_price: combo.combo_price,
            image_url: combo.image_url,
            stock: 999, // Assume combo is always in stock
            is_featured: false,
            is_flash_sale: false,
            created_at: combo.created_at,
          };

          set({
            items: [
              ...items,
              {
                id: `combo-${combo.id}`,
                product: comboAsProduct,
                quantity,
                isCombo: true,
                comboId: combo.id,
                comboName: combo.name,
                comboPrice: combo.combo_price,
                comboItems: combo.items,
              },
            ],
          });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          if (item.isCombo && item.comboPrice) {
            return total + item.comboPrice * item.quantity;
          }
          const price = item.product.sale_price || item.product.price;
          return total + price * item.quantity;
        }, 0),
    }),
    {
      name: "cart-storage",
    },
  ),
);
