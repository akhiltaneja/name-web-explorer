
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface SearchBarProps {
  name: string;
  setName: (name: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchLimitReached: boolean;
  user: any;
  checksRemaining: number;
}

const SearchBar = ({ 
  name, 
  setName, 
  handleSearch, 
  isSearching, 
  searchLimitReached,
  user,
  checksRemaining
}: SearchBarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !searchLimitReached && !isSearching && name.trim()) {
      handleSearch();
    } else if (e.key === "Enter" && searchLimitReached) {
      if (!user) {
        toast({
          title: "Search limit reached",
          description: "You've used all your free searches. Sign in or upgrade for more.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request limit reached",
          description: "Please upgrade to continue searching.",
          variant: "destructive",
        });
        navigate("/profile?tab=plans");
      }
    }
  };

  return (
    <Card className={`mb-8 shadow-md border-purple-100 overflow-hidden ${searchLimitReached ? 'opacity-80' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row relative">
          {searchLimitReached && (
            <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Limit Reached</h3>
                <p className="text-gray-600 mb-4">
                  You've used all your {user ? (user.plan === 'free' ? '3 daily' : '500 monthly') : '3 daily'} searches.
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
            disabled={isSearching || searchLimitReached || !name.trim()}
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
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 text-sm flex justify-between items-center">
          <span className="text-gray-500">
            {checksRemaining === Infinity ? (
              "Unlimited searches available"
            ) : (
              <>
                <span className={checksRemaining === 0 ? "text-red-500 font-semibold" : "text-gray-700 font-semibold"}>
                  {checksRemaining}
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
  );
};

export default SearchBar;
