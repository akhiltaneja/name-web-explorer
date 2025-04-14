
import { Link } from "react-router-dom";
import { PlanOption } from "@/types/socialMedia";
import PlanCard from "./PlanCard";
import { forwardRef } from "react";

const defaultPlans: PlanOption[] = [
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

interface PlansSectionProps {
  plans?: PlanOption[];
  currentPlan: string | undefined;
  onSelectPlan: (planId: string) => void;
}

const PlansSection = forwardRef<HTMLDivElement, PlansSectionProps>(
  ({ plans = defaultPlans, currentPlan, onSelectPlan }, ref) => {
    return (
      <div ref={ref} id="plans-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 mb-2">
            Get more searches and unlock powerful features with our premium plans.
          </p>
          <Link to="/pricing" className="text-blue-600 hover:text-blue-800 font-medium">
            View detailed pricing information
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              currentPlan={currentPlan} 
              onSelectPlan={onSelectPlan} 
            />
          ))}
        </div>
      </div>
    );
  }
);

PlansSection.displayName = "PlansSection";

export default PlansSection;
