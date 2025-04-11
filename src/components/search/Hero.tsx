
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import SearchProgress from "./SearchProgress";
import SearchFeatures from "./SearchFeatures";
import GuestLimitWarning from "./GuestLimitWarning";

interface HeroProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchProgress: number;
  searchLimitReached: boolean;
  user: any;
  guestCheckAvailable: boolean;
  checksRemaining: number;
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
  checksRemaining
}: HeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 pt-12 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Find Anyone <span className="text-purple-600">Online</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Discover social media profiles and online presence with a simple name search.
          Fast, comprehensive results from across the web.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <SearchBar 
            name={name} 
            setName={setName} 
            handleSearch={handleSearch} 
            isSearching={isSearching}
            searchLimitReached={searchLimitReached}
            user={user}
            checksRemaining={checksRemaining}
          />
          
          {isSearching && (
            <SearchProgress progress={searchProgress} />
          )}
          
          <GuestLimitWarning 
            user={user} 
            guestCheckAvailable={guestCheckAvailable} 
            isSearching={isSearching}
            searchLimitReached={searchLimitReached}
          />
        </div>
        
        {!name && !isSearching && (
          <div className="mt-8">
            <SearchFeatures />
            <div className="mt-10">
              <Button
                onClick={() => navigate("/pricing")}
                className="bg-purple-600 hover:bg-purple-700 font-semibold"
                size="lg"
              >
                View Plans & Pricing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
