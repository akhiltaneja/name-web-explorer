
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import SearchProgress from "./SearchProgress";
import GuestLimitWarning from "./GuestLimitWarning";
import RecentSearches from "./RecentSearches";
import SearchFeatures from "./SearchFeatures";
import GradeAppDialog from "./GradeAppDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: (query?: string) => void;
  isSearching: boolean;
  searchProgress: number;
  searchLimitReached: boolean;
  user: any;
  profile: any;
  guestCheckAvailable: boolean;
  checksRemaining: number;
  showLimitModal: boolean;
  setShowLimitModal: (show: boolean) => void;
  recentSearches: string[];
  onClearSearch: (search: string) => void;
  onClearAllSearches: () => void;
  isDeepVerifying?: boolean;
  verificationProgress?: number;
}

const Hero = ({
  name,
  setName,
  handleSearch,
  isSearching,
  searchProgress,
  searchLimitReached,
  user,
  profile,
  guestCheckAvailable,
  checksRemaining,
  showLimitModal,
  setShowLimitModal,
  recentSearches,
  onClearSearch,
  onClearAllSearches,
  isDeepVerifying = false,
  verificationProgress = 0
}: HeroProps) => {
  const [showRating, setShowRating] = useState(false);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  
  // Updated to use user prop instead of isAuthenticated
  const isAuthenticated = !!user;

  // Show rating dialog after a successful search for logged in users
  useEffect(() => {
    if (
      isAuthenticated &&
      name && 
      !isSearching && 
      searchProgress === 100 && 
      !showRating &&
      localStorage.getItem("lastRatingPrompt")
    ) {
      const lastPrompt = parseInt(localStorage.getItem("lastRatingPrompt") || "0");
      const now = Date.now();
      
      // Show the prompt if we haven't shown it in over 7 days
      if (now - lastPrompt > 7 * 24 * 60 * 60 * 1000) {
        const searchesSinceLastPrompt = parseInt(localStorage.getItem("searchesSinceLastPrompt") || "0");
        
        // Only show after at least 3 searches since last prompt
        if (searchesSinceLastPrompt >= 3) {
          setShowRating(true);
          localStorage.setItem("lastRatingPrompt", now.toString());
          localStorage.setItem("searchesSinceLastPrompt", "0");
        } else {
          localStorage.setItem("searchesSinceLastPrompt", (searchesSinceLastPrompt + 1).toString());
        }
      }
    }
  }, [isSearching, searchProgress, name, isAuthenticated, showRating]);

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-8 pb-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Find Anyone's Social Media
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all social media profiles and online presence for any name or username
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <SearchBar
            name={name}
            setName={setName}
            handleSearch={handleSearch}
            isSearching={isSearching || isDeepVerifying}
            checksRemaining={checksRemaining}
            searchLimitReached={searchLimitReached}
            user={user}
            profile={profile}
            showLimitModal={showLimitModal}
            setShowLimitModal={setShowLimitModal}
          />

          <SearchProgress 
            isSearching={isSearching} 
            searchProgress={searchProgress} 
            name={name} 
            isDeepVerifying={isDeepVerifying}
            verificationProgress={verificationProgress}
          />
          
          {!user && (
            <GuestLimitWarning 
              user={user}
              guestCheckAvailable={guestCheckAvailable}
              isSearching={isSearching}
              searchLimitReached={searchLimitReached}
            />
          )}

          {recentSearches.length > 0 && !isSearching && !name && (
            <RecentSearches
              recentSearches={recentSearches}
              onSearch={(search) => {
                setName(search);
                handleSearch(search);
              }}
              onClearSearch={onClearSearch}
              onClearAll={onClearAllSearches}
            />
          )}

          {!isSearching && !name && <SearchFeatures />}
        </div>
      </div>

      {/* Plan Limit Modal */}
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

      <GradeAppDialog 
        open={showRating} 
        setOpen={setShowRating} 
      />
    </section>
  );
};

export default Hero;
