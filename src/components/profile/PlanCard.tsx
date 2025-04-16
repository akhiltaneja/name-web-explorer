import { useEffect, useRef } from "react";
import { PlanOption } from "@/types/socialMedia";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

interface PlanCardProps {
  plan: PlanOption;
  currentPlan: string | undefined;
  onSelectPlan: (planId: string) => void;
}

const PlanCard = ({ plan, currentPlan, onSelectPlan }: PlanCardProps) => {
  useEffect(() => {
    // Premium plan PayPal button
    if (plan.id === 'premium') {
      window.paypal?.HostedButtons?.({
        hostedButtonId: "XQZZ6RFD6SF7U"
      }).render("#paypal-container-premium");
    }
    // Unlimited plan PayPal button
    if (plan.id === 'unlimited') {
      window.paypal?.HostedButtons?.({
        hostedButtonId: "9UJUQBPHTR9MY"
      }).render("#paypal-container-unlimited");
    }
  }, [plan.id]);

  return (
    <Card className={`relative border-gray-200 shadow-sm ${
      plan.popular 
        ? 'border-purple-200 shadow-purple-100' 
        : plan.id === 'unlimited' 
          ? 'border-blue-200 shadow-blue-100'
          : ''
    }`}>
      {plan.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            Most Popular
          </span>
        </div>
      )}
      {plan.originalPrice && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Save {Math.round((1 - plan.price/plan.originalPrice) * 100)}%
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className={`text-xl ${
          plan.popular 
            ? 'text-purple-600' 
            : plan.id === 'unlimited' 
              ? 'text-blue-600'
              : 'text-gray-900'
        }`}>
          {plan.name}
        </CardTitle>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
            {plan.originalPrice && (
              <p className="text-lg font-normal text-gray-500 line-through ml-2">${plan.originalPrice}</p>
            )}
            <span className="text-sm font-normal text-gray-500 ml-1">{plan.id !== 'free' ? '/month' : ''}</span>
          </div>
          <p className="text-sm text-gray-500">{plan.limit}</p>
        </div>
        
        <Separator className="bg-gray-200" />
        
        <div>
          <p className="text-sm font-medium mb-2 text-gray-700">Features:</p>
          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        {currentPlan === plan.id ? (
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
          <div 
            id={`paypal-container-${plan.id}`}
            className="w-full min-h-[40px]"
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
