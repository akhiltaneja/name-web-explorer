
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
import { useEffect, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import GradeAppDialog from "./GradeAppDialog";

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
  profile?: any; // Add profile to the interface
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
  setShowLimitModal = () => {},
  profile // Destructure profile from props
}: SearchBarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showGradeDialog, setShowGradeDialog] = useState(false);

  // Show grade dialog when searches reach 0
  useEffect(() => {
    if (checksRemaining === 0 && !isSearching && name.trim() && !showGradeDialog) {
      // Only show after search is attempted with 0 remaining
      const hasShownGradeDialog = localStorage.getItem('has_shown_grade_dialog_today');
      if (!hasShownGradeDialog) {
        setShowGradeDialog(true);
        // Mark as shown for today to avoid showing multiple times in a day
        localStorage.setItem('has_shown_grade_dialog_today', 'true');
        // Reset this flag at midnight UTC
        const now = new Date();
        const msTillMidnight = new Date().setUTCHours(24, 0, 0, 0) - now.getTime();
        setTimeout(() => {
          localStorage.removeItem('has_shown_grade_dialog_today');
        }, msTillMidnight);
      }
    }
  }, [checksRemaining, isSearching, name, showGradeDialog]);

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
            <div className="flex items-center gap-3">
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
              {/* Show countdown timer if checks remaining is 0 */}
              {checksRemaining === 0 && <CountdownTimer />}
            </div>
            {!user && (
              <Link to="/auth" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in for more
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grade App Dialog */}
      <GradeAppDialog 
        open={showGradeDialog} 
        setOpen={setShowGradeDialog} 
      />
    </>
  );
};

export default SearchBar;
