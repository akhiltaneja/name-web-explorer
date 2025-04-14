
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Tag, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlanOption } from "@/types/socialMedia";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CartProvider, useCart } from "@/context/CartContext";
import FlashDealTimer from "@/components/checkout/FlashDealTimer";

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
  }, [planId]);

  const handlePlanSwitch = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      
      // Update the URL with the new plan ID without navigating
      const url = new URL(window.location.href);
      url.searchParams.set('plan', planId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  if (!selectedPlan) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-600">Complete your purchase to unlock more searches</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plans.filter(p => p.id !== 'free').map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPlan.id === plan.id 
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
                    {selectedPlan.id === plan.id && (
                      <div className="absolute top-3 right-3">
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

          <Card className="mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethods loading={loading} setLoading={setLoading} />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
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
      <main className="flex-grow py-3 px-4">
        <CartProvider>
          <CartContent />
        </CartProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
