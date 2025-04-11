
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface SearchBarProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchLimitReached: boolean;
  user: any;
}

const SearchBar = ({ 
  name, 
  setName, 
  handleSearch, 
  isSearching, 
  searchLimitReached,
  user
}: SearchBarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !searchLimitReached && !isSearching) handleSearch();
  };

  return (
    <Card className={`mb-8 shadow-md border-purple-100 overflow-hidden ${searchLimitReached ? 'opacity-75' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row relative">
          {searchLimitReached && (
            <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Limit Reached</h3>
                <p className="text-gray-600 mb-4">
                  You've used all your 3 daily searches.
                  {!user ? " Sign in for more searches." : ""}
                </p>
                {!user ? (
                  <Link to="/auth">
                    <Button className="mr-2 bg-purple-600 hover:bg-purple-700">Sign In</Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => navigate("/profile?tab=plans")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          )}
          <Input
            type="text"
            placeholder="Enter first and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border-0 rounded-none text-lg py-7 px-6 md:rounded-l-lg text-gray-900 placeholder:text-gray-500 focus-visible:ring-purple-500"
            onKeyDown={handleKeyDown}
            disabled={searchLimitReached || isSearching}
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || searchLimitReached}
            className="md:w-auto w-full bg-purple-600 hover:bg-purple-700 rounded-none md:rounded-r-lg py-7 text-base"
            size="lg"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search size={20} />
                <span>Search Profiles</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
