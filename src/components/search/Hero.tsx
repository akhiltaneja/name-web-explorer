
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import SearchProgress from "./SearchProgress";
import GuestLimitWarning from "./GuestLimitWarning";
import RecentSearches from "./RecentSearches";
import SearchFeatures from "./SearchFeatures";
import GradeAppDialog from "./GradeAppDialog";
import { PlanLimitModal } from "../profile/PlanLimitModal";
import { useAuth } from "@/context/AuthContext";

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
  const { isAuthenticated } = useAuth();

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
  }, [isSearching, searchProgress, name, isAuthenticated]);

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
              guestCheckAvailable={guestCheckAvailable}
              searchCount={3 - checksRemaining}
            />
          )}

          {recentSearches.length > 0 && !isSearching && !name && (
            <RecentSearches
              searches={recentSearches}
              onSelectSearch={(search) => {
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

      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        isAuthenticated={!!user}
        searchCount={checksRemaining}
        profile={profile}
      />

      <GradeAppDialog
        isOpen={showRating}
        onClose={() => setShowRating(false)}
      />
    </section>
  );
};

export default Hero;
