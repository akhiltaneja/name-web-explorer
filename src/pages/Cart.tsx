
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CreditCard, Check, Lock, Tag, Zap } from "lucide-react";
import { PlanOption } from "@/types/socialMedia";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlashDealTimer from "@/components/checkout/FlashDealTimer";
import DiscountCode from "@/components/checkout/DiscountCode";
import { Separator } from "@/components/ui/separator";

// Add PayPal types to avoid TypeScript errors
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: any) => {
        render: (containerId: string) => void;
      };
    };
  }
}

const plans: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for occasional use.',
    price: 0,
    limit: '3 daily searches',
    features: [
      'Basic social media search',
      'Limited profile information',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For regular users needing more searches.',
    price: 9,
    limit: '1000 credits (1 credit = 1 search)',
    features: [
      'Full social media search',
      'Enhanced profile details',
      'Priority support',
    ],
    creditsAmount: 1000,
    popular: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'For power users with high search needs.',
    price: 20,
    originalPrice: 30,
    limit: 'Unlimited searches',
    features: [
      'Unlimited social media search',
      'Full profile information',
      '24/7 priority support',
      'Advanced analytics',
    ],
  },
];

// Custom PayPal Icon component as it's not in lucide-react
const PaypalLogo = () => (
  <svg className="w-16 h-5" viewBox="0 0 101 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38.594 7.213h-8.011c-0.47 0-0.87 0.344-0.944 0.804l-2.775 17.652c-0.055 0.351 0.213 0.668 0.574 0.668h3.861c0.47 0 0.87-0.343 0.943-0.804l0.75-4.748c0.074-0.46 0.473-0.803 0.943-0.803h2.534c4.523 0 7.133-2.189 7.816-6.528 0.31-1.895 0.013-3.384-0.884-4.426-0.989-1.14-2.738-1.814-5.808-1.814zM39.343 13.643c-0.375 2.455-2.248 2.455-4.062 2.455h-1.032l0.724-4.583c0.043-0.276 0.283-0.476 0.562-0.476h0.473c1.234 0 2.4 0 3.001 0.704 0.359 0.422 0.468 1.047 0.335 1.9zM62.457 13.576h-3.87c-0.28 0-0.519 0.203-0.562 0.476l-0.144 0.917-0.23-0.333c-0.712-1.032-2.296-1.377-3.876-1.377-3.628 0-6.727 2.746-7.332 6.603-0.313 1.922 0.132 3.76 1.22 5.044 1.001 1.184 2.427 1.677 4.127 1.677 2.917 0 4.532-1.873 4.532-1.873l-0.146 0.911c-0.055 0.35 0.213 0.668 0.573 0.668h3.486c0.47 0 0.87-0.343 0.943-0.804l1.776-11.242c0.055-0.35-0.213-0.667-0.574-0.667zM57.138 19.89c-0.317 1.875-1.801 3.133-3.703 3.133-0.952 0-1.713-0.306-2.2-0.886-0.483-0.576-0.666-1.396-0.512-2.308 0.295-1.856 1.805-3.152 3.67-3.152 0.93 0 1.686 0.31 2.183 0.896 0.499 0.59 0.695 1.415 0.562 2.317zM80.493 13.576h-3.885c-0.37 0-0.717 0.185-0.924 0.493l-5.324 7.839-2.256-7.551c-0.142-0.473-0.579-0.794-1.075-0.794h-3.817c-0.463 0-0.788 0.455-0.642 0.895l4.247 12.461-3.994 5.637c-0.314 0.443 0.002 1.056 0.532 1.056h3.881c0.367 0 0.71-0.179 0.921-0.483l12.836-18.498c0.309-0.444-0.005-1.055-0.531-1.055zM88.013 7.213h-8.012c-0.47 0-0.87 0.344-0.944 0.804l-2.775 17.652c-0.055 0.351 0.213 0.668 0.574 0.668h4.169c0.334 0 0.62-0.244 0.673-0.573l0.789-5.003c0.074-0.46 0.473-0.803 0.943-0.803h2.534c4.523 0 7.133-2.189 7.816-6.528 0.31-1.895 0.013-3.384-0.884-4.426-0.988-1.14-2.739-1.814-5.808-1.814zM88.76 13.643c-0.374 2.455-2.248 2.455-4.062 2.455h-1.032l0.724-4.583c0.044-0.276 0.283-0.476 0.562-0.476h0.473c1.234 0 2.4 0 3.001 0.704 0.359 0.422 0.468 1.047 0.334 1.9zM111.874 13.576h-3.87c-0.28 0-0.52 0.203-0.562 0.476l-0.144 0.917-0.229-0.333c-0.713-1.032-2.297-1.377-3.877-1.377-3.628 0-6.727 2.746-7.331 6.603-0.314 1.922 0.131 3.76 1.219 5.044 1.001 1.184 2.427 1.677 4.127 1.677 2.917 0 4.532-1.873 4.532-1.873l-0.146 0.911c-0.055 0.35 0.213 0.668 0.574 0.668h3.486c0.47 0 0.87-0.343 0.943-0.804l1.776-11.242c0.055-0.35-0.213-0.667-0.574-0.667zM106.555 19.89c-0.317 1.875-1.801 3.133-3.703 3.133-0.952 0-1.713-0.306-2.199-0.886-0.483-0.576-0.666-1.396-0.512-2.308 0.295-1.856 1.805-3.152 3.67-3.152 0.93 0 1.686 0.31 2.183 0.896 0.499 0.59 0.695 1.415 0.562 2.317zM15.848 13.576h-3.894c-0.373 0-0.571 0.45-0.32 0.726l9.053 9.94-8.512 12.021c-0.224 0.316 0.004 0.752 0.394 0.752h3.894c0.276 0 0.534-0.133 0.694-0.358l8.493-12.069-9.109-10.27c-0.156-0.176-0.38-0.276-0.613-0.276v-0.005zM26.28 26.209c-0.451 0.266-0.963 0.415-1.504 0.415-1.007 0-1.535-0.609-1.535-1.611 0-0.304 0.031-0.621 0.096-0.979 0.086-0.604 0.594-3.917 0.594-3.917h3.007l0.397-2.459h-3.007l0.47-2.969h-3.64c-0.168 0-0.312 0.122-0.338 0.286l-1.85 11.711c-0.111 0.705-0.171 1.39-0.171 1.993 0 3.184 1.725 5.433 5.089 5.433 1.663 0 3.063-0.343 4.269-1.091l0.85-2.812h-0.012z" fill="#003087"/>
    <path d="M11.876 0h-3.984c-0.47 0-0.87 0.344-0.943 0.804l-2.775 17.652c-0.055 0.351 0.213 0.668 0.573 0.668h4.095c0.334 0 0.62-0.244 0.673-0.573l0.789-5.003c0.074-0.46 0.474-0.804 0.944-0.804h2.534c4.522 0 7.132-2.189 7.816-6.527 0.309-1.895 0.012-3.385-0.885-4.427-0.989-1.14-2.739-1.814-5.808-1.814h-0.028zM12.623 6.429c-0.375 2.456-2.248 2.456-4.062 2.456h-1.032l0.724-4.584c0.044-0.276 0.283-0.476 0.562-0.476h0.473c1.234 0 2.4 0 3.001 0.704 0.359 0.422 0.468 1.048 0.335 1.9zM35.737 6.363h-3.871c-0.28 0-0.519 0.203-0.562 0.476l-0.144 0.917-0.23-0.333c-0.712-1.032-2.296-1.377-3.876-1.377-3.628 0-6.727 2.746-7.332 6.602-0.313 1.923 0.132 3.761 1.22 5.045 1.001 1.184 2.427 1.676 4.127 1.676 2.917 0 4.532-1.872 4.532-1.872l-0.146 0.91c-0.055 0.351 0.213 0.668 0.573 0.668h3.486c0.47 0 0.87-0.343 0.943-0.803l1.776-11.243c0.055-0.35-0.213-0.667-0.574-0.667h0.075zM30.418 12.677c-0.317 1.875-1.801 3.134-3.703 3.134-0.952 0-1.713-0.306-2.2-0.885-0.483-0.577-0.666-1.397-0.512-2.308 0.295-1.856 1.805-3.153 3.67-3.153 0.93 0 1.686 0.31 2.183 0.896 0.499 0.59 0.695 1.415 0.562 2.317z" fill="#009CDE"/>
  </svg>
);

const Cart = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planId);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();

  // Calculate the total price after discount
  const calculateTotal = (price: number) => {
    if (discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  };

  useEffect(() => {
    if (!planId) {
      navigate('/profile?tab=plans');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.id === 'free') {
      navigate('/profile?tab=plans');
      return;
    }

    setSelectedPlan(plan);
    setSelectedPlanId(plan.id);

    // Load PayPal SDK script
    const loadPayPalScript = () => {
      if (document.getElementById('paypal-script')) {
        renderPayPalButtons();
        return;
      }

      const script = document.createElement('script');
      script.id = 'paypal-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&buyer-country=US&currency=USD&components=buttons&enable-funding=card&disable-funding=venmo,paylater`;
      script.setAttribute('data-sdk-integration-source', 'developer-studio');
      
      script.onload = () => {
        console.log("PayPal script loaded successfully");
        renderPayPalButtons();
      };

      script.onerror = (error) => {
        console.error("Failed to load PayPal script:", error);
        toast({
          title: "Payment Error",
          description: "Failed to load payment provider. Please try again later.",
          variant: "destructive",
        });
      };

      document.body.appendChild(script);
    };

    if (selectedPlan) {
      loadPayPalScript();
    }
  }, [planId, selectedPlan, discountPercent]);

  const renderPayPalButtons = () => {
    if (!selectedPlan || !window.paypal) {
      return;
    }

    // Clear previous buttons if they exist
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const cardButtonContainer = document.getElementById('paypal-card-container');
    
    if (paypalButtonContainer) {
      paypalButtonContainer.innerHTML = '';
    }
    
    if (cardButtonContainer) {
      cardButtonContainer.innerHTML = '';
    }

    try {
      const createOrderHandler = async () => {
        try {
          setLoading(true);
          
          if (!user) {
            toast({
              title: "Authentication required",
              description: "You need to be logged in to make a purchase.",
              variant: "destructive",
            });
            navigate('/auth');
            return "";
          }
          
          // Calculate the discounted amount
          const amount = calculateTotal(selectedPlan.price);
          
          // Call our Supabase Edge Function to create the order
          const response = await supabase.functions.invoke('create-paypal-order', {
            body: {
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              amount: amount.toFixed(2) // Ensure exactly 2 decimal places
            }
          });
          
          console.log("Create order response:", response);
          
          if (!response.data || !response.data.id) {
            throw new Error('Failed to create PayPal order');
          }
          
          return response.data.id;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          toast({
            title: "Payment initialization failed",
            description: "Could not start the payment process. Please try again.",
            variant: "destructive",
          });
          return "";
        } finally {
          setLoading(false);
        }
      };

      const onApproveHandler = async (data: any) => {
        try {
          setLoading(true);
          
          const { orderID } = data;
          console.log("Order approved:", orderID);
          
          // Call our Supabase Edge Function to capture the payment
          const response = await supabase.functions.invoke('capture-paypal-order', {
            body: {
              orderId: orderID,
              userId: user?.id,
              planId: selectedPlan.id
            }
          });
          
          console.log("Capture response:", response);
          
          if (!response.data || !response.data.success) {
            throw new Error('Failed to capture PayPal payment');
          }
          
          // Payment successful
          toast({
            title: "Payment successful!",
            description: `Your ${selectedPlan.name} plan is now active.`,
          });
          
          await refreshProfile();
          navigate('/profile');
        } catch (error) {
          console.error('Error capturing PayPal payment:', error);
          toast({
            title: "Payment failed",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      // Paypal payment button
      if (paypalButtonContainer) {
        window.paypal.Buttons({
          style: {
            shape: "pill",
            layout: "vertical",
            color: "blue",
            label: "paypal"
          },
          createOrder: createOrderHandler,
          onApprove: onApproveHandler,
          onCancel: () => {
            toast({
              title: "Payment cancelled",
              description: "You've cancelled the payment process. No payment was made.",
            });
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            toast({
              title: "Payment error",
              description: "An error occurred during the payment process. Please try again.",
              variant: "destructive",
            });
          }
        }).render('#paypal-button-container');
      }
      
      // Credit/Debit card button 
      if (cardButtonContainer) {
        window.paypal.Buttons({
          style: {
            shape: "pill",
            layout: "vertical",
            color: "black",
            label: "pay"
          },
          createOrder: createOrderHandler,
          onApprove: onApproveHandler,
          onCancel: () => {
            toast({
              title: "Payment cancelled",
              description: "You've cancelled the payment process. No payment was made.",
            });
          },
          onError: (err: any) => {
            console.error('PayPal Card error:', err);
            toast({
              title: "Payment error",
              description: "An error occurred during the payment process. Please try again.",
              variant: "destructive",
            });
          }
        }).render('#paypal-card-container');
      }
      
      console.log("PayPal buttons rendered");
    } catch (error) {
      console.error("Error rendering PayPal buttons:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment options. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Handle plan switch
  const handlePlanSwitch = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setSelectedPlanId(planId);
    }
  };

  // Handle discount code application
  const handleApplyDiscount = (percent: number) => {
    setDiscountPercent(percent);
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow py-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-base text-gray-600">
              Complete your purchase to unlock more searches
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Select Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.filter(p => p.id !== 'free').map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPlanId === plan.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handlePlanSwitch(plan.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{plan.name}</h3>
                            <p className="text-sm text-gray-500">{plan.limit}</p>
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-xl font-bold">${plan.price}</span>
                            {plan.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ${plan.originalPrice}
                              </span>
                            )}
                            <span className="text-sm text-gray-500 ml-1">/month</span>
                          </div>
                        </div>
                        {selectedPlanId === plan.id && (
                          <div className="absolute top-4 right-4">
                            <Check className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                        {plan.id === 'unlimited' && (
                          <div className="mt-2">
                            <FlashDealTimer initialMinutes={10} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="paypal" onValueChange={(value) => setPaymentMethod(value as "paypal" | "card")}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="paypal" className="flex items-center justify-center h-14">
                        <PaypalLogo />
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center justify-center h-14">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>Credit/Debit Card</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="paypal" className="space-y-4">
                      <div id="paypal-button-container" className="w-full"></div>
                      {loading && (
                        <div className="text-center py-4">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-2 text-gray-600">Processing payment...</p>
                        </div>
                      )}
                      <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-2">
                        <Lock className="h-4 w-4 mr-1 text-gray-400" />
                        Secure payment powered by PayPal
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="card" className="space-y-4">
                      <div id="paypal-card-container" className="w-full"></div>
                      {loading && (
                        <div className="text-center py-4">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-2 text-gray-600">Processing payment...</p>
                        </div>
                      )}
                      <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-2">
                        <Lock className="h-4 w-4 mr-1 text-gray-400" />
                        Card details are securely processed by PayPal
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card className="bg-white shadow-md sticky top-4">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
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
                    
                    {discountPercent > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span className="font-medium">Discount ({discountPercent}%)</span>
                        <span className="font-medium">-${(selectedPlan.price * discountPercent / 100).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span>${calculateTotal(selectedPlan.price).toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-2">
                      <DiscountCode onApplyDiscount={handleApplyDiscount} />
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Plan Includes:</h4>
                      <ul className="space-y-2">
                        {selectedPlan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 border-t bg-gray-50 pt-4">
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
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
