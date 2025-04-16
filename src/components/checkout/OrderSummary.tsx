
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan } = useCart();

  useEffect(() => {
    if (selectedPlan?.id === 'premium') {
      // Render PayPal button for premium plan
      window.paypal?.HostedButtons?.({
        hostedButtonId: "9UJUQBPHTR9MY"
      }).render("#paypal-container-premium");
    }
  }, [selectedPlan]);

  if (!selectedPlan) return null;

  return (
    <Card className="bg-white shadow-sm sticky top-4">
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Complete Purchase</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex flex-col justify-center items-center">
            <div className="mb-4">
              <div className="text-lg font-semibold">{selectedPlan.name} Plan</div>
              <div className="text-xl font-bold mt-1">${selectedPlan.price}/month</div>
              <div className="text-sm text-gray-500 mt-1">{selectedPlan.limit}</div>
            </div>
            
            <div id="paypal-container-premium" className="w-full max-w-md min-h-[150px]"></div>
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
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
