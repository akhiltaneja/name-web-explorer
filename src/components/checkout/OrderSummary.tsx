
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
        <CardTitle className="text-lg font-semibold">Complete Purchase</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {selectedPlan.id === 'premium' ? (
            <div className="flex justify-center">
              <form 
                action="https://www.paypal.com/ncp/payment/9UJUQBPHTR9MY" 
                method="post" 
                target="_blank" 
                className="inline-grid justify-items-center content-start gap-2"
              >
                <style>{`.pp-9UJUQBPHTR9MY{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}`}</style>
                <input className="pp-9UJUQBPHTR9MY" type="submit" value="Buy Now" />
                <div className="flex flex-col items-center gap-2 w-full">
                  <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" className="h-6" />
                  <div className="text-sm text-gray-600">
                    Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-4 inline-block align-middle ml-1"/>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-center">
              <form 
                action="https://www.paypal.com/ncp/payment/2UTTJZG37LRMN" 
                method="post" 
                target="_blank" 
                className="inline-grid justify-items-center content-start gap-2"
              >
                <style>{`.pp-2UTTJZG37LRMN{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}`}</style>
                <input className="pp-2UTTJZG37LRMN" type="submit" value="Buy Now" />
                <div className="flex flex-col items-center gap-2 w-full">
                  <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" className="h-6" />
                  <div className="text-sm text-gray-600">
                    Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-4 inline-block align-middle ml-1"/>
                  </div>
                </div>
              </form>
            </div>
          )}
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
