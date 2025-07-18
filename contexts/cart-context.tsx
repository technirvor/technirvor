"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  _id: any
  productId: string
  name: string
  price: number
  image: string
  slug: string
  quantity: number
}



interface CartContextType {
  cartItems: CartItem[]
  addItemToCart: (item: CartItem) => void
  removeItemFromCart: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalPrice: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  const addItemToCart = useCallback((item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId)
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      } else {
        return [...prevItems, item]
      }
    })
  }, [])

  const removeItemFromCart = useCallback(
    (productId: string) => {
      setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart.",
      })
    },
    [toast],
  )

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId)
      }
      return prevItems.map((item) => (item.productId === productId ? { ...item, quantity: quantity } : item))
    })
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
    toast({
      title: "Cart cleared",
      description: "Your cart has been emptied.",
    })
  }, [toast])

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
