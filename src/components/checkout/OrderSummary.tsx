
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import DiscountCode from "./DiscountCode";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan, calculateTotal, setDiscountPercent } = useCart();

  if (!selectedPlan) return null;

  return (
    <Card className="bg-white shadow-md sticky top-4">
      <CardHeader className="border-b pb-3 pt-3">
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">{selectedPlan.name} Plan</span>
            <div className="text-right">
              {selectedPlan.originalPrice && (
                <span className="text-sm text-gray-500 line-through block">
                  ${selectedPlan.originalPrice}
                </span>
              )}
              <span className="font-medium">${selectedPlan.price}</span>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span>${calculateTotal(selectedPlan.price).toFixed(2)}</span>
          </div>
          
          <div className="pt-2">
            <DiscountCode onApplyDiscount={setDiscountPercent} />
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Plan Includes:</h4>
            <ul className="space-y-1">
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
      <CardFooter className="flex flex-col space-y-2 border-t bg-gray-50 pt-3 pb-3">
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
