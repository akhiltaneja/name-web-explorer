import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlanOption } from "@/types/socialMedia";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CartProvider, useCart } from "@/context/CartContext";
import FlashDealTimer from "@/components/checkout/FlashDealTimer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

declare global {
  interface Window {
    paypal?: any;
  }
}

const plans: PlanOption[] = [
  {
    id: 'premium',
    name: 'Premium',
    description: 'For regular users needing more searches.',
    price: 9,
    limit: '500 credits (1 credit = 1 search)',
    features: [
      'Full social media search',
      'Enhanced profile details',
      'Priority support',
    ],
    creditsAmount: 500,
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

const CartContent = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const planId = searchParams.get('plan');
  const navigate = useNavigate();
  const { selectedPlan, setSelectedPlan } = useCart();

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
  }, [planId, navigate, setSelectedPlan]);

  const handlePlanSwitch = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      
      const url = new URL(window.location.href);
      url.searchParams.set('plan', planId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    sessionStorage.setItem('cartReturnPath', location.pathname + location.search);
  }, [location]);

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
        <p className="text-sm text-gray-600 mt-1">Select your plan and payment method</p>
      </div>
      
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <Card className="mb-6 shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg">Select Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <RadioGroup 
                value={selectedPlan.id} 
                onValueChange={handlePlanSwitch}
                className="space-y-4"
              >
                {plans.filter(p => p.id !== 'free').map((plan) => (
                  <label
                    key={plan.id}
                    htmlFor={`plan-${plan.id}`}
                    className={`relative block border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedPlan.id === plan.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <RadioGroupItem 
                        value={plan.id} 
                        id={`plan-${plan.id}`} 
                        className="mt-1 mr-3"
                      />
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-gray-900 text-base">
                              {plan.name}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{plan.limit}</p>
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
                        
                        {plan.id === 'unlimited' && (
                          <div className="mt-2">
                            <FlashDealTimer initialMinutes={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <PaymentMethods loading={loading} setLoading={setLoading} />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-5">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow py-8 px-4">
        <CartProvider>
          <CartContent />
        </CartProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
