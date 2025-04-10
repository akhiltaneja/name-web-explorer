
import { PlanOption } from "@/types/socialMedia";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PlanCardProps {
  plan: PlanOption;
  currentPlan: string | undefined;
  onSelectPlan: (planId: string) => void;
}

const PlanCard = ({ plan, currentPlan, onSelectPlan }: PlanCardProps) => {
  return (
    <Card className={`relative border-gray-200 shadow-sm ${
      plan.id === 'premium' 
        ? 'border-blue-200 shadow-blue-100' 
        : plan.id === 'unlimited' 
          ? 'border-purple-200 shadow-purple-100'
          : ''
    }`}>
      {plan.id === 'premium' && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Popular Choice
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className={`text-xl ${
          plan.id === 'premium' 
            ? 'text-blue-600' 
            : plan.id === 'unlimited' 
              ? 'text-purple-600'
              : 'text-gray-900'
        }`}>
          {plan.name}
        </CardTitle>
        <p className="text-sm text-gray-500">{plan.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Button 
            className={`w-full ${
              plan.id === 'premium' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            Upgrade
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
