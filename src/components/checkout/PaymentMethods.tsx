
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import PaypalLogo from "./PayPalLogo";

interface PaymentMethodsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PaymentMethods = ({ loading, setLoading }: PaymentMethodsProps) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=BAAtdxoyXiYsItLT8-n_CXdFo4Wxj3rwVTy9nDu1i7a1Yez6Ohwcks5kF8JRQdJN6eEpxSPUsOG62manmw&components=hosted-buttons&disable-funding=venmo&currency=USD";
    script.crossOrigin = "anonymous";
    script.async = true;
    
    script.onload = () => {
      scriptLoaded.current = true;
      if (paypalContainerRef.current) {
        window.paypal.HostedButtons({
          hostedButtonId: "9UJUQBPHTR9MY"
        }).render("#paypal-container-9UJUQBPHTR9MY");
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      scriptLoaded.current = false;
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Complete your purchase</h3>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PaypalLogo />
              </div>
              
              <div 
                ref={paypalContainerRef}
                className="w-full min-h-[150px]"
                id="paypal-container-9UJUQBPHTR9MY"
              />
              
              <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-4">
                <Lock className="h-4 w-4 mr-1 text-gray-400" />
                Secure payment processed by PayPal
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
