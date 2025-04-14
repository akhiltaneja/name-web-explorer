
import { createContext, useContext, useState, ReactNode } from "react";
import { PlanOption } from "@/types/socialMedia";

interface CartContextType {
  selectedPlan: PlanOption | null;
  setSelectedPlan: (plan: PlanOption | null) => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  calculateTotal: (price: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const calculateTotal = (price: number) => {
    if (discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  };

  return (
    <CartContext.Provider 
      value={{ 
        selectedPlan, 
        setSelectedPlan, 
        discountPercent, 
        setDiscountPercent,
        calculateTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
