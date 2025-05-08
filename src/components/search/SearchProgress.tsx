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
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const progressUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Show progress when searching starts
    if (isSearching && !hasCompletedOnce) {
      setShowProgress(true);
      
      // Clear any existing timers to prevent duplicate progress bars
      if (progressUpdateTimer.current) {
        clearTimeout(progressUpdateTimer.current);
      }
    } else if (!isSearching) {
      // Keep the completion message briefly before hiding
      if (searchProgress >= 100) {
        // Mark as completed to prevent showing progress again in the same session
        setHasCompletedOnce(true);
        
        // Hide after a delay
        progressUpdateTimer.current = setTimeout(() => {
          setShowProgress(false);
        }, 2000);
        
        return () => {
          if (progressUpdateTimer.current) clearTimeout(progressUpdateTimer.current);
        };
      }
    }
  }, [isSearching, searchProgress, hasCompletedOnce]);
  
  // Reset when the name changes (new search)
  useEffect(() => {
    setHasCompletedOnce(false);
  }, [name]);
  
  const progress = isSearching ? searchProgress : 0;
  
  if (!showProgress) return null;
  
  return (
    <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-fade-in flex items-start">
      <div className="mr-4 bg-blue-100 p-2 rounded-full">
        {progress < 100 ? (
          <Search className="h-6 w-6 text-blue-600" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-600" />
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-blue-800 mb-1">
          {progress < 100 ? "Searching for profiles..." : "Search complete!"}
        </h3>
        <p className="text-blue-700 mb-2">Finding "{name}" across social networks</p>
        <Progress value={progress} className="h-2 bg-blue-100" />
      </div>
    </div>
  );
};

export default SearchProgress;
