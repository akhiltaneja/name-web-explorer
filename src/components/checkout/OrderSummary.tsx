
import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/use-toast";

const OrderSummary = () => {
  const navigate = useNavigate();
  const { selectedPlan } = useCart();

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPalScript = () => {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=BAAtdxoyXiYsItLT8-n_CXdFo4Wxj3rwVTy9nDu1i7a1Yez6Ohwcks5kF8JRQdJN6eEpxSPUsOG62manmw&components=hosted-buttons&disable-funding=venmo&currency=USD";
      script.crossOrigin = "anonymous";
      script.async = true;
      
      script.onload = () => {
        if (window.paypal) {
          // Set up a listener for payment completion
          window.addEventListener('message', (event) => {
            if (event.data === 'paymentComplete') {
              toast({
                title: "Payment Successful",
                description: "Thank you for your purchase!",
              });
            }
          });
          
          const premiumButton = window.paypal.HostedButtons({
            hostedButtonId: "9UJUQBPHTR9MY"
          });
          
          const unlimitedButton = window.paypal.HostedButtons({
            hostedButtonId: "2UTTJZG37LRMN"
          });

          premiumButton.render("#paypal-container-9UJUQBPHTR9MY");
          unlimitedButton.render("#paypal-container-2UTTJZG37LRMN");
        }
      };
      
      document.head.appendChild(script);
      
      return () => {
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        
        // Remove event listener
        window.removeEventListener('message', () => {});
      };
    };

    loadPayPalScript();
  }, []);

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
              <div id="paypal-container-9UJUQBPHTR9MY"></div>
              <div className="flex flex-col items-center gap-2 w-full mt-4">
                <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" className="h-6" />
                <div className="text-sm text-gray-600">
                  Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-4 inline-block align-middle ml-1"/>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div id="paypal-container-2UTTJZG37LRMN"></div>
              <div className="flex flex-col items-center gap-2 w-full mt-4">
                <img src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg" alt="cards" className="h-6" />
                <div className="text-sm text-gray-600">
                  Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-4 inline-block align-middle ml-1"/>
                </div>
              </div>
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
