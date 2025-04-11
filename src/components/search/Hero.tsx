
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/search/SearchBar";
import SearchProgress from "@/components/search/SearchProgress";
import GuestLimitWarning from "@/components/search/GuestLimitWarning";
import RecentSearches from "@/components/search/RecentSearches";

interface HeroProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: (query?: string) => void;
  isSearching: boolean;
  searchProgress: number;
  searchLimitReached: boolean;
  user: any;
  guestCheckAvailable: boolean;
  checksRemaining: number;
  showLimitModal?: boolean;
  setShowLimitModal?: (show: boolean) => void;
  recentSearches?: string[];
  searchInitiated?: boolean;
}

const Hero = ({
  name,
  setName,
  handleSearch,
  isSearching,
  searchProgress,
  searchLimitReached,
  user,
  guestCheckAvailable,
  checksRemaining,
  showLimitModal,
  setShowLimitModal,
  recentSearches = [],
  searchInitiated = false,
}: HeroProps) => {
  const handleSearchSelect = (query: string) => {
    setName(query);
    // No need to call handleSearch here as the navigation happens in RecentSearches component
  };

  return (
    <section className="pt-8 pb-6 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        {!searchInitiated && (
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
          checksRemaining={checksRemaining}
          showLimitModal={showLimitModal}
          setShowLimitModal={setShowLimitModal}
          searchInitiated={searchInitiated}
        />

        {!searchInitiated && recentSearches && recentSearches.length > 0 && (
          <RecentSearches 
            recentSearches={recentSearches} 
            onSearchSelect={handleSearchSelect} 
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
