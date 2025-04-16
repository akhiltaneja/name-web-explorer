
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
      window.paypal?.HostedButtons?.({
        hostedButtonId: "XQZZ6RFD6SF7U"
      }).render("#paypal-container-premium");
    } else if (selectedPlan?.id === 'unlimited') {
      window.paypal?.HostedButtons?.({
        hostedButtonId: "2UTTJZG37LRMN"
      }).render("#paypal-container-unlimited");
    }
  }, [selectedPlan?.id]);

  if (!selectedPlan) return null;

  return (
    <Card className="bg-white shadow-sm sticky top-4">
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Complete Purchase</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex flex-col justify-center items-center">
            <div 
              id={`paypal-container-${selectedPlan.id}`}
              className="w-full max-w-md min-h-[150px]"
            />
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

