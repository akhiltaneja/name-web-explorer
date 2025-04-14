
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import DiscountCode from "./DiscountCode";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan, calculateTotal, setDiscountPercent } = useCart();

  if (!selectedPlan) return null;

  const discount = selectedPlan.originalPrice 
    ? selectedPlan.originalPrice - selectedPlan.price 
    : 0;
    
  const finalPrice = calculateTotal(selectedPlan.price);

  return (
    <Card className="bg-white shadow-sm sticky top-4">
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-base mb-2">Selected Plan</h3>
            <div className="flex items-start justify-between mb-1">
              <span className="text-gray-700">{selectedPlan.name} Plan</span>
              <div className="text-right">
                {selectedPlan.originalPrice && (
                  <span className="text-sm text-gray-500 line-through block">
                    ${selectedPlan.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="font-medium">${selectedPlan.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-3">{selectedPlan.limit}</div>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Special Discount</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
          
          <div className="pt-3">
            <DiscountCode onApplyDiscount={setDiscountPercent} />
          </div>
          
          <div className="rounded-lg bg-blue-50 p-3 mt-4 border border-blue-100">
            <div className="flex items-center text-blue-800 font-medium mb-2">
              <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
              Secure Purchase
            </div>
            <p className="text-sm text-blue-700">
              Your payment is secured with industry standard encryption. We do not store your full payment details.
            </p>
          </div>
          
          <div className="pt-2">
            <h4 className="font-medium text-gray-700 mb-2">What's included:</h4>
            <ul className="space-y-2">
              {selectedPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t bg-gray-50 p-5">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/profile?tab=plans')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <div className="text-xs text-gray-500 text-center">
          By completing this purchase, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
