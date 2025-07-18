"use client"

import type React from "react"

import { createContext, useContext, useMemo, useReducer } from "react"

/* ─────────  Types  ───────── */
export interface CartItem {
  id: string
  qty: number
}

type Action = { type: "ADD"; id: string; qty?: number } | { type: "REMOVE"; id: string } | { type: "CLEAR" }

/* ─────────  Reducer  ───────── */
function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.id)
      if (exists) {
        return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty + (action.qty ?? 1) } : i))
      }
      return [...state, { id: action.id, qty: action.qty ?? 1 }]
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id)
    case "CLEAR":
      return []
    default:
      return state
  }
}

/* ─────────  Context  ───────── */
interface CartContextValue {
  items: CartItem[]
  totalQty: number
  add(id: string, qty?: number): void
  remove(id: string): void
  clear(): void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

/* ─────────  Provider  ───────── */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])

  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const add = (id: string, qty = 1) => dispatch({ type: "ADD", id, qty })
  const remove = (id: string) => dispatch({ type: "REMOVE", id })
  const clear = () => dispatch({ type: "CLEAR" })

  const value = useMemo(() => ({ items, totalQty, add, remove, clear }), [items, totalQty])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/* ─────────  Hook  ───────── */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider>")
  }
  return ctx
}
