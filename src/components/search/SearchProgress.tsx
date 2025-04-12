
import { Progress } from "@/components/ui/progress";
import { Search, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [showVerification, setShowVerification] = useState(false);
  
  // Effect to auto-hide the verification notification after 2 seconds when completed
  useEffect(() => {
    if (isDeepVerifying && verificationProgress === 100) {
      const timer = setTimeout(() => {
        setShowVerification(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (isDeepVerifying) {
      setShowVerification(true);
    }
  }, [isDeepVerifying, verificationProgress]);
  
  if (!isSearching && (!isDeepVerifying || !showVerification)) return null;
  
  return (
    <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-fade-in flex items-start">
      <div className="mr-4 bg-blue-100 p-2 rounded-full">
        {isSearching ? (
          <Search className="h-6 w-6 text-blue-600" />
        ) : isDeepVerifying ? (
          verificationProgress < 100 ? (
            <Search className="h-6 w-6 text-amber-600" />
          ) : (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )
        ) : (
          <AlertCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
      <div className="flex-grow">
        {isSearching && (
          <>
            <h3 className="font-bold text-blue-800 mb-1">Searching profiles...</h3>
            <p className="text-blue-700 mb-2">Finding "{name}" across {50} social networks</p>
            <Progress value={searchProgress} className="h-2 bg-blue-100" />
          </>
        )}
        
        {isDeepVerifying && showVerification && (
          <>
            <h3 className="font-bold text-amber-800 mb-1">
              {verificationProgress < 100 ? "Verifying profiles..." : "Verification complete!"}
            </h3>
            <p className="text-amber-700 mb-2">
              {verificationProgress < 100 
                ? `Checking for "User Not Found" errors in ${name}'s profiles` 
                : "All profiles have been verified"}
            </p>
            <Progress 
              value={verificationProgress} 
              className={`h-2 ${verificationProgress < 100 ? "bg-amber-100" : "bg-green-100"}`} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchProgress;
