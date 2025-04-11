
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getSocialMediaProfiles, 
  getCategories, 
  getAdditionalResults, 
  groupProfilesByCategory, 
  checkUrlStatus,
  checkDomainAvailability 
} from "@/utils/socialMediaSearch";
import { useSearchLimit } from "./useSearchLimit";

export const useSearch = (user: any, profile: any, refreshProfile: () => void) => {
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [additionalResults, setAdditionalResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [profilesByCategory, setProfilesByCategory] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInitiated = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    guestCheckAvailable, 
    searchLimitReached,
    setSearchLimitReached, 
    checksRemaining,
    hasReachedSearchLimit, 
    incrementSearchCount,
    saveSearchHistory
  } = useSearchLimit(user, profile);

  // Force show modal when limit is reached on component mount
  useEffect(() => {
    if (searchLimitReached || checksRemaining <= 0) {
      setShowLimitModal(true);
    }
  }, [searchLimitReached, checksRemaining]);

  const handleSearch = async (searchQuery = name) => {
    // Convert to string in case a different type is passed
    const queryString = String(searchQuery);
    
    // Validate input
    if (!queryString?.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    // First, verify if search limit is reached - regardless of counter
    if (searchLimitReached || checksRemaining <= 0 || hasReachedSearchLimit()) {
      setShowLimitModal(true);
      setSearchLimitReached(true);
      
      const message = !user 
        ? "Please sign in or upgrade to continue searching."
        : "Please upgrade to continue searching.";
      
      toast({
        title: "Request limit reached",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Try to increment search count - if it returns false, we've hit the limit
    const canProceed = await incrementSearchCount();
    if (!canProceed) {
      // The increment function already shows the appropriate toast
      setSearchLimitReached(true);
      setShowLimitModal(true);
      return;
    }

    // If we get here, we can start the search
    setIsSearching(true);
    setSearchProgress(0);
    const startTime = performance.now();
    
    const nameParts = queryString.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        const newProgress = prev + (Math.random() * 15);
        return newProgress < 90 ? newProgress : prev;
      });
    }, 200);
    
    setTimeout(async () => {
      try {
        // Double check limits before processing results
        if (searchLimitReached || hasReachedSearchLimit()) {
          clearInterval(progressInterval);
          setIsSearching(false);
          setShowLimitModal(true);
          return;
        }
        
        let profiles = getSocialMediaProfiles(username, queryString);
        const additionalProfiles = getAdditionalResults(username, queryString);
        
        const activeProfiles = await Promise.all(
          profiles.map(async profile => {
            const isActive = await checkUrlStatus(profile.url);
            return {
              ...profile,
              status: isActive ? 'active' : 'inactive'
            };
          })
        );
        
        profiles = activeProfiles.filter(profile => profile.status === 'active');
        
        const domainResults = await checkDomainAvailability(username);
        setAvailableDomains(domainResults);
        
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        const endTime = performance.now();
        const timeElapsed = Math.round(endTime - startTime);
        setSearchTime(timeElapsed);
        
        setTimeout(() => {
          setResults(profiles);
          setAdditionalResults(additionalProfiles);
          const categorizedProfiles = groupProfilesByCategory(profiles);
          setProfilesByCategory(categorizedProfiles);
          setCategories(getCategories(profiles));
          setIsSearching(false);
          
          toast({
            title: "Search complete",
            description: `Found ${profiles.length} potential profiles for ${queryString}`,
          });
          
          // Update URL with the search query
          if (!location.pathname.includes('/search/')) {
            navigate(`/search/${encodeURIComponent(queryString)}`, { replace: true });
          }
          
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          
          if (user) {
            saveSearchHistory(queryString, profiles.length)
              .then(success => {
                if (success) refreshProfile();
              });
          }
        }, 500);
      } catch (error) {
        console.error("Search error:", error);
        clearInterval(progressInterval);
        setIsSearching(false);
        setSearchProgress(0);
        
        toast({
          title: "Search failed",
          description: "An error occurred while searching. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return {
    name,
    setName,
    results,
    additionalResults,
    isSearching,
    searchProgress,
    searchTime,
    availableDomains,
    profilesByCategory,
    categories,
    guestCheckAvailable,
    searchLimitReached,
    checksRemaining,
    hasReachedSearchLimit,
    handleSearch,
    searchInitiated,
    resultsRef,
    showLimitModal,
    setShowLimitModal
  };
};
