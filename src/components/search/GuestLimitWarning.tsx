
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestLimitWarningProps {
  user: any;
  guestCheckAvailable: boolean;
  isSearching: boolean;
  searchLimitReached: boolean;
}

const GuestLimitWarning = ({ 
  user, 
  guestCheckAvailable, 
  isSearching, 
  searchLimitReached 
}: GuestLimitWarningProps) => {
  // Only show for guests who have reached their limit when not actively searching
  if (user || !searchLimitReached || isSearching) return null;
  
  return (
    <div className="mt-4 p-6 bg-amber-50 rounded-lg border border-amber-200 animate-fade-in flex flex-col sm:flex-row items-center justify-between shadow-md">
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="mr-4 bg-amber-100 p-2 rounded-full">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-amber-800 mb-1">Request Limit Reached</h3>
          <p className="text-amber-700">
            You've used your 3 daily searches. Sign in or upgrade to continue searching.
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button asChild variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
          <Link to="/auth">Sign In</Link>
        </Button>
        <Button asChild className="bg-amber-600 hover:bg-amber-700">
          <Link to="/pricing">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
};

export default GuestLimitWarning;
