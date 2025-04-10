
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const plans = {
  premium: {
    name: "Premium",
    price: 19,
    features: [
      "500 monthly searches",
      "Enhanced profile details",
      "Priority support",
    ]
  },
  unlimited: {
    name: "Unlimited",
    price: 49,
    features: [
      "Unlimited searches",
      "Full profile information",
      "24/7 priority support",
      "Advanced analytics",
    ]
  }
};

const Cart = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cartItem, setCartItem] = useState<any>(null);
  
  // Form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  
  useEffect(() => {
    if (planId && (planId === 'premium' || planId === 'unlimited')) {
      setCartItem(plans[planId as keyof typeof plans]);
    } else {
      navigate('/pricing');
    }
  }, [planId, navigate]);
  
  const handleCheckout = () => {
    // Form validation
    if (!cardName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter the name on card",
        variant: "destructive",
      });
      return;
    }
    
    if (!cardNumber.trim() || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive",
      });
      return;
    }
    
    if (!expiry.trim() || !/^\d{2}\/\d{2}$/.test(expiry)) {
      toast({
        title: "Invalid expiry date",
        description: "Please enter expiry date in MM/YY format",
        variant: "destructive",
      });
      return;
    }
    
    if (!cvv.trim() || !/^\d{3}$/.test(cvv)) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid 3-digit CVV",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      toast({
        title: "Payment Successful!",
        description: `You have successfully upgraded to the ${cartItem?.name} plan.`,
      });
      navigate("/profile");
    }, 2000);
  };
  
  if (!cartItem) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center mb-8 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Pricing
            </Button>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-gray-600" />
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input 
                      id="cardName" 
                      placeholder="John Smith" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/YY" 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-gray-600" />
                  Billing Information
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={user?.email || ""}
                      readOnly={!!user}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Billing Address</Label>
                    <Input id="address" placeholder="123 Main St" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Order Summary
                  </h2>
                  
                  <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-medium text-lg">{cartItem.name} Plan</p>
                        <p className="text-sm text-gray-500">Monthly subscription</p>
                      </div>
                      <span className="font-bold text-lg">${cartItem.price}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {cartItem.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start">
                          <div className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5">✓</div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">${cartItem.price}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <span className="text-gray-800 font-medium">Total</span>
                      <span className="text-gray-900 font-bold">${cartItem.price}.00</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Purchase
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
