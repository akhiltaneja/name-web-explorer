
import { useState, useRef } from "react";
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

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInitiated = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { 
    guestCheckAvailable, 
    hasReachedSearchLimit, 
    incrementSearchCount,
    saveSearchHistory
  } = useSearchLimit(user, profile);

  const handleSearch = async (searchQuery = name) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    // Double check search limit - early exit if limit reached
    if (hasReachedSearchLimit()) {
      if (!user) {
        const lastCheckTime = localStorage.getItem("candidate_checker_guest_last_check");
        
        if (lastCheckTime) {
          const lastCheck = new Date(lastCheckTime);
          const now = new Date();
          const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
          const hoursRemaining = Math.ceil(24 - hoursSinceLastCheck);
          
          toast({
            title: "Search limit reached",
            description: `Please sign in to continue searching or wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Usage limit reached",
          description: `You've reached your ${profile?.plan} plan limit. Please upgrade for more searches.`,
          variant: "destructive",
        });
        navigate("/profile");
      }
      return;
    }

    // Increment counter before search starts to ensure limits are enforced
    // If incrementSearchCount returns false, we've hit the limit
    const canProceed = await incrementSearchCount();
    if (!canProceed) {
      toast({
        title: "Search limit reached",
        description: user 
          ? `You've reached your ${profile?.plan} plan limit. Please upgrade for more searches.`
          : "You've reached your 3 daily free searches. Sign in or upgrade for more.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    const startTime = performance.now();
    
    const nameParts = searchQuery.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        const newProgress = prev + (Math.random() * 15);
        return newProgress < 90 ? newProgress : prev;
      });
    }, 200);
    
    setTimeout(async () => {
      try {
        let profiles = getSocialMediaProfiles(username, searchQuery);
        const additionalProfiles = getAdditionalResults(username, searchQuery);
        
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
            description: `Found ${profiles.length} potential profiles for ${searchQuery}`,
          });
          
          // Update URL with the search query
          if (!location.pathname.includes('/search/')) {
            navigate(`/search/${encodeURIComponent(searchQuery)}`, { replace: true });
          }
          
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          
          if (user) {
            saveSearchHistory(searchQuery, profiles.length)
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
    hasReachedSearchLimit,
    handleSearch,
    searchInitiated,
    resultsRef
  };
};
