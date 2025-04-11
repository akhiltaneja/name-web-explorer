
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/search/SearchBar";
import SearchProgress from "@/components/search/SearchProgress";
import GuestLimitWarning from "@/components/search/GuestLimitWarning";
import RecentSearches from "@/components/search/RecentSearches";

interface HeroProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchProgress: number;
  searchLimitReached: boolean;
  user: any;
  profile?: any; // Add profile to the interface
  guestCheckAvailable: boolean;
  checksRemaining: number;
  showLimitModal?: boolean;
  setShowLimitModal?: (show: boolean) => void;
  recentSearches?: string[];
  onClearSearch?: (search: string) => void;
  onClearAllSearches?: () => void;
}

const Hero = ({
  name,
  setName,
  handleSearch,
  isSearching,
  searchProgress,
  searchLimitReached,
  user,
  profile, // Destructure profile
  guestCheckAvailable,
  checksRemaining,
  showLimitModal,
  setShowLimitModal,
  recentSearches = [],
  onClearSearch,
  onClearAllSearches
}: HeroProps) => {
  // Function to handle when user clicks on a recent search
  const handleRecentSearch = (searchTerm: string) => {
    setName(searchTerm);
    if (!searchLimitReached && checksRemaining > 0) {
      handleSearch();
    }
  };

  return (
    <section className="pt-8 pb-6 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        {!name && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Anyone's Social Media Profiles
            </h1>
            <p className="text-lg text-gray-600 mb-4 max-w-3xl mx-auto">
              Enter a name to discover social media accounts, personal websites, and more.
              Our advanced people search engine helps you find the digital footprint of anyone.
            </p>
          </div>
        )}

        <SearchBar
          name={name}
          setName={setName}
          handleSearch={handleSearch}
          isSearching={isSearching}
          searchLimitReached={searchLimitReached}
          user={user}
          profile={profile} // Pass profile to SearchBar
          checksRemaining={checksRemaining}
          showLimitModal={showLimitModal}
          setShowLimitModal={setShowLimitModal}
        />

        {!name && !isSearching && recentSearches.length > 0 && (
          <RecentSearches 
            recentSearches={recentSearches} 
            onClearSearch={onClearSearch}
            onClearAll={onClearAllSearches}
            onSearch={handleRecentSearch}
          />
        )}

        {isSearching && (
          <Card className="mb-8 border-purple-100">
            <CardContent className="py-6">
              <SearchProgress 
                isSearching={isSearching} 
                searchProgress={searchProgress}
                name={name}
              />
            </CardContent>
          </Card>
        )}

        <GuestLimitWarning
          user={user}
          guestCheckAvailable={guestCheckAvailable}
          isSearching={isSearching}
          searchLimitReached={searchLimitReached}
        />
      </div>
    </section>
  );
};

export default Hero;

