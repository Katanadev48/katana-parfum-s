import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type CartLine = { productId: string; volume: "50 ml" | "100 ml"; quantity: number }
type CartApi = { items: CartLine[]; add: (item: CartLine) => void; remove: (productId: string, volume: CartLine["volume"]) => void; setQuantity: (productId: string, volume: CartLine["volume"], quantity: number) => void; clear: () => void }
const CartContext = createContext<CartApi | null>(null)
const KEY = "maison-sillage-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]") as CartLine[] } catch { return [] }
  })
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])
  const value = useMemo<CartApi>(() => ({
    items,
    add: (line) => setItems((current) => {
      const match = current.find((item) => item.productId === line.productId && item.volume === line.volume)
      return match ? current.map((item) => item === match ? { ...item, quantity: Math.min(99, item.quantity + line.quantity) } : item) : [...current, line]
    }),
    remove: (productId, volume) => setItems((current) => current.filter((item) => item.productId !== productId || item.volume !== volume)),
    setQuantity: (productId, volume, quantity) => setItems((current) => current.map((item) => item.productId === productId && item.volume === volume ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) } : item)),
    clear: () => setItems([]),
  }), [items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used inside CartProvider")
  return value
}
