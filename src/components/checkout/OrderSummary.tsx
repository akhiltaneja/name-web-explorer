
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan } = useCart();

  if (!selectedPlan) return null;

  return (
    <Card className="bg-white shadow-sm sticky top-4">
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between mb-1">
              {selectedPlan.id === 'premium' ? (
                <div 
                  id="paypal-container-9UJUQBPHTR9MY"
                  className="w-full min-h-[40px]"
                />
              ) : (
                <div 
                  id="paypal-container-2UTTJZG37LRMN"
                  className="w-full min-h-[40px]"
                />
              )}
            </div>
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
