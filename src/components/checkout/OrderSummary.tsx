
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { usePayPalPayment } from "@/hooks/usePayPalPayment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan } = useCart();
  const [paymentError, setPaymentError] = useState('');

  const planConfig = {
    amount: selectedPlan?.price || 0,
    productId: selectedPlan?.id || ''
  };

  // Initialize PayPal payment system with loading state
  const { isLoading, error } = usePayPalPayment(planConfig);

  // Update error state when error changes
  useEffect(() => {
    if (error) {
      setPaymentError(error);
    } else {
      setPaymentError('');
    }
  }, [error]);

  // Clear any error when component unmounts or when selectedPlan changes
  useEffect(() => {
    setPaymentError('');
  }, [selectedPlan]);

  if (!selectedPlan) return null;

  return (
    <Card className="bg-white shadow-sm sticky top-4">
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Complete Purchase</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {paymentError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col justify-center items-center">
            <div className="mb-4">
              <div className="text-lg font-semibold">{selectedPlan.name} Plan</div>
              <div className="text-xl font-bold mt-1">${selectedPlan.price}/month</div>
              <div className="text-sm text-gray-500 mt-1">{selectedPlan.limit}</div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-600">Processing payment...</p>
              </div>
            ) : (
              <div id="paypal-button-container" className="w-full max-w-md min-h-[150px]"></div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t bg-gray-50 p-5">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/profile?tab=plans')}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
