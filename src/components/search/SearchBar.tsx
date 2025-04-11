
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useEffect } from "react";

interface SearchBarProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchLimitReached: boolean;
  user: any;
  checksRemaining: number;
  showLimitModal?: boolean;
  setShowLimitModal?: (show: boolean) => void;
}

const SearchBar = ({ 
  name, 
  setName, 
  handleSearch, 
  isSearching, 
  searchLimitReached,
  user,
  checksRemaining,
  showLimitModal = false,
  setShowLimitModal = () => {}
}: SearchBarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching && name.trim()) {
      if (searchLimitReached || checksRemaining <= 0) {
        // Show limit modal and toast instead of trying to search
        setShowLimitModal(true);
        if (!user) {
          toast({
            title: "Request limit reached",
            description: "You've used all your free searches. Sign in or upgrade for more.",
            variant: "destructive",
            duration: 5000, // Longer duration
          });
        } else {
          toast({
            title: "Request limit reached",
            description: "Please upgrade to continue searching.",
            variant: "destructive",
            duration: 5000, // Longer duration
          });
        }
      } else {
        // Only proceed with search if we have credits
        handleSearch();
      }
    }
  };

  const isLimitReached = searchLimitReached || checksRemaining <= 0;

  // Disable the button completely if limit is reached
  const isButtonDisabled = isSearching || !name.trim() || isLimitReached;

  return (
    <>
      <Card className={`mb-8 shadow-md border-purple-100 overflow-hidden`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row relative">
            <Input
              type="text"
              placeholder="Enter first and last name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 border-0 rounded-none text-lg py-7 px-6 md:rounded-l-lg text-gray-900 placeholder:text-gray-500 focus-visible:ring-purple-500"
              onKeyDown={handleKeyDown}
              disabled={isSearching}
            />
            <Button 
              onClick={() => {
                if (isLimitReached) {
                  setShowLimitModal(true);
                  toast({
                    title: "Request limit reached",
                    description: !user ? "Sign in or upgrade for more searches." : "Please upgrade to continue searching.",
                    variant: "destructive",
                    duration: 5000,
                  });
                } else {
                  handleSearch();
                }
              }}
              disabled={isButtonDisabled}
              className={`md:w-auto w-full ${isLimitReached ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} rounded-none md:rounded-r-lg py-7 text-base`}
              size="lg"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLimitReached && <Lock size={18} />}
                  <Search size={20} />
                  <span>Search Profiles</span>
                </div>
              )}
            </Button>
          </div>
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 text-sm flex justify-between items-center">
            <span className="text-gray-500">
              {checksRemaining === Infinity ? (
                "Unlimited searches available"
              ) : (
                <>
                  <span className={checksRemaining <= 0 ? "text-red-500 font-semibold" : "text-gray-700 font-semibold"}>
                    {checksRemaining > 0 ? checksRemaining : 0}
                  </span> 
                  <span> {checksRemaining === 1 ? "search" : "searches"} remaining</span>
                </>
              )}
            </span>
            {!user && (
              <Link to="/auth" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in for more
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Limit Modal - Only show when the button is clicked and limit is reached */}
      <Dialog 
        open={showLimitModal} 
        onOpenChange={(open) => {
          // Allow closing the modal
          setShowLimitModal(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Request Limit Reached</DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex justify-center my-4">
                <Lock className="h-12 w-12 text-red-500" />
              </div>
              <p className="mb-4">
                You've used all your available searches. 
                {!user ? " Please sign in or upgrade your plan to continue searching." :
                         " You've reached your daily limit of 3 searches. Please upgrade your plan to continue searching."}
              </p>
              {!user && (
                <p className="text-sm text-gray-500">
                  Free users are limited to 3 searches per day.
                </p>
              )}
              {user && profile?.plan === 'free' && (
                <p className="text-sm text-gray-500">
                  Your free plan allows 3 searches per day. Upgrade for more searches.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            {!user && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  navigate("/auth");
                  setShowLimitModal(false);
                }}
              >
                Sign In
              </Button>
            )}
            <Button
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              onClick={() => {
                navigate(user ? "/profile?tab=plans" : "/pricing");
                setShowLimitModal(false);
              }}
            >
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBar;
