import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlanOption } from "@/types/socialMedia";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, CreditCard, Check } from "lucide-react";

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
    price: 19,
    limit: '500 monthly searches',
    features: [
      'Unlimited social media search',
      'Enhanced profile details',
      'Priority support',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'For power users with high search needs.',
    price: 49,
    limit: 'Unlimited searches',
    features: [
      'Unlimited social media search',
      'Full profile information',
      '24/7 priority support',
      'Advanced analytics',
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSelectPlan = async (plan: PlanOption) => {
    navigate(`/cart?plan=${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">
              Get more searches and unlock powerful features with our premium plans.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col ${
                plan.id === 'premium' 
                  ? 'border-purple-200 shadow-purple-100' 
                  : plan.id === 'unlimited' 
                    ? 'border-purple-200 shadow-purple-100'
                    : ''
              }`}>
                {plan.id === 'premium' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Popular Choice
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className={`text-xl ${
                    plan.id === 'premium' 
                      ? 'text-purple-600' 
                      : plan.id === 'unlimited' 
                        ? 'text-purple-600'
                        : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">${plan.price}<span className="text-sm font-normal text-gray-500">{plan.id !== 'free' ? '/month' : ''}</span></p>
                    <p className="text-sm text-gray-500">{plan.limit}</p>
                  </div>
                  
                  <Separator className="bg-gray-200" />
                  
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">Features:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5">✓</div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  {profile?.plan === plan.id ? (
                    <Button 
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-not-allowed" 
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button 
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" 
                      disabled
                    >
                      Free Default
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full bg-purple-600 hover:bg-purple-700 text-white`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Confirm & Pay
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Solution?</h2>
            <p className="text-gray-600 mb-6">
              If you have special requirements or need a tailored plan for your organization, contact our sales team.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
