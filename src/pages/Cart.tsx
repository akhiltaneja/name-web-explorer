
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, CreditCard, Check, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const Cart = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'premium';
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Plan details based on the selected plan
  const planDetails = {
    premium: {
      name: 'Premium',
      price: 19,
      billingCycle: 'monthly',
      features: [
        'Unlimited social media search',
        'Enhanced profile details',
        'Priority support',
        '500 monthly searches',
      ]
    },
    unlimited: {
      name: 'Unlimited',
      price: 49,
      billingCycle: 'monthly',
      features: [
        'Unlimited social media search',
        'Full profile information',
        '24/7 priority support',
        'Advanced analytics',
        'Unlimited searches',
      ]
    }
  }[planId as 'premium' | 'unlimited'] || {
    name: 'Premium',
    price: 19,
    billingCycle: 'monthly',
    features: [
      'Unlimited social media search',
      'Enhanced profile details',
      'Priority support',
      '500 monthly searches',
    ]
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate coupon validation
    setTimeout(() => {
      // For demo purposes, accept any coupon code with a 10% discount
      const validCoupon = couponCode.trim().toLowerCase();
      if (validCoupon) {
        const discount = Math.round(planDetails.price * 0.1);
        setDiscountAmount(discount);
        setAppliedCoupon(couponCode);
        toast({
          title: "Coupon applied",
          description: `${couponCode.toUpperCase()} coupon applied with a $${discount} discount!`,
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast({
      title: "Coupon removed",
      description: "The coupon code has been removed.",
    });
  };

  const handleCheckout = () => {
    setLoading(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Checkout Coming Soon",
        description: "This is a demo. Payment processing would happen here.",
      });
      setLoading(false);
    }, 1000);
  };

  // Calculate totals
  const subtotal = planDetails.price;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/pricing')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Plans
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Purchase</h1>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">{planDetails.name} Plan</h3>
                      <p className="text-gray-500 text-sm">Billed {planDetails.billingCycle}</p>
                    </div>
                    <div className="text-lg font-medium">${planDetails.price}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Plan includes:</h4>
                    <ul className="space-y-1">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon || loading}
                        className="w-full"
                      />
                    </div>
                    {!appliedCoupon ? (
                      <Button 
                        onClick={handleApplyCoupon}
                        disabled={loading}
                        variant="outline"
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleRemoveCoupon}
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-800 font-medium">{appliedCoupon.toUpperCase()} applied</span>
                      </div>
                      <span className="text-green-800 font-medium">-${discountAmount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <div className="mb-4 text-gray-500">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <p>Secure payment processing coming soon</p>
                    <p className="text-sm">This is a demo application</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-xl">Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </div>
                    ) : (
                      'Complete Purchase'
                    )}
                  </Button>
                </CardFooter>
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
