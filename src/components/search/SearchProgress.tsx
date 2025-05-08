import { Progress } from "@/components/ui/progress";
import { Search, CheckCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface SearchProgressProps {
  isSearching: boolean;
  searchProgress: number;
  name: string;
  isDeepVerifying?: boolean;
  verificationProgress?: number;
}

const SearchProgress = ({ 
  isSearching, 
  searchProgress, 
  name,
  isDeepVerifying = false,
  verificationProgress = 0
}: SearchProgressProps) => {
  const [showProgress, setShowProgress] = useState(false);
  const progressDisplayed = useRef(false);
  
  // Only show progress once per search session
  useEffect(() => {
    if (isSearching && !progressDisplayed.current) {
      setShowProgress(true);
      progressDisplayed.current = true;
    } else if (!isSearching && !isDeepVerifying) {
      // Reset the flag when search is complete
      progressDisplayed.current = false;
      // Keep the completion message briefly before hiding
      if (searchProgress >= 100) {
        const timer = setTimeout(() => {
          setShowProgress(false);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setShowProgress(false);
      }
    }
  }, [isSearching, isDeepVerifying, searchProgress]);
  
  // Combine the search and verification progress into a single progress bar
  const combinedIsSearching = isSearching || isDeepVerifying;
  const combinedProgress = isSearching 
    ? searchProgress 
    : isDeepVerifying 
      ? Math.min(verificationProgress + searchProgress, 100)
      : 0;
  
  if (!showProgress) return null;
  
  return (
    <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-fade-in flex items-start">
      <div className="mr-4 bg-blue-100 p-2 rounded-full">
        {combinedProgress < 100 ? (
          <Search className="h-6 w-6 text-blue-600" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-600" />
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-blue-800 mb-1">
          {combinedProgress < 100 ? "Searching for profiles..." : "Search complete!"}
        </h3>
        <p className="text-blue-700 mb-2">Finding "{name}" across social networks and verifying results</p>
        <Progress value={combinedProgress} className="h-2 bg-blue-100" />
      </div>
    </div>
  );
};

export default SearchProgress;
