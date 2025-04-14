
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getSocialMediaProfiles, 
  getCategories, 
  getAdditionalResults, 
  groupProfilesByCategory, 
  checkUrlStatus,
  checkDomainAvailability,
  deepVerifyProfiles
} from "@/utils/socialMediaSearch";
import { useSearchLimit } from "./useSearchLimit";
import { SocialMediaProfile } from "@/types/socialMedia";

export const useSearch = (user: any, profile: any, refreshProfile: () => void) => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [additionalResults, setAdditionalResults] = useState<SocialMediaProfile[]>([]);
  const [unverifiedResults, setUnverifiedResults] = useState<SocialMediaProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [profilesByCategory, setProfilesByCategory] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isDeepVerifying, setIsDeepVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const query = searchParams.get('query');
    const pathSegments = location.pathname.split('/');
    
    if ((query || (pathSegments[1] === 'search' && pathSegments[2])) && !searchInitiated.current) {
      searchInitiated.current = true;
      
      let searchQuery = query;
      if (!searchQuery && pathSegments[1] === 'search' && pathSegments[2]) {
        searchQuery = decodeURIComponent(pathSegments[2]);
      }
      
      if (searchQuery) {
        setName(searchQuery);
        // Don't auto-search if limit reached
        if (!hasReachedSearchLimit() && checksRemaining > 0) {
          handleSearch(searchQuery);
        } else {
          // Just show the modal if we're at limit
          setShowLimitModal(true);
        }
      }
    }
    
    const state = location.state as { returnTo?: string; action?: string } | null;
    if (state?.action === "emailReport" && user) {
      setEmailModalOpen(true);
    }
  }, [searchParams, location, checksRemaining, user]);

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

    // Check if search limit is reached - strict enforcement
    if (hasReachedSearchLimit() || searchLimitReached || checksRemaining <= 0) {
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
      return;
    }

    // If we get here, we can start the search
    setIsSearching(true);
    setSearchProgress(0);
    const startTime = performance.now();
    
    const nameParts = queryString.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    // Slower progress animation that completes only once
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        // Slower increment with easing
        const increment = Math.max(5 - Math.floor(prev / 10), 1) * 0.5;
        const newProgress = prev + increment;
        return newProgress < 95 ? newProgress : prev;
      });
    }, 300);
    
    setTimeout(async () => {
      try {
        // Double check limits before processing results
        if (hasReachedSearchLimit() || searchLimitReached) {
          clearInterval(progressInterval);
          setIsSearching(false);
          setShowLimitModal(true);
          return;
        }
        
        let profiles = getSocialMediaProfiles(username, queryString);
        let additionalProfiles = getAdditionalResults(username, queryString);
        
        // Add the new links requested by the user
        const newProfiles = [
          {
            platform: "Twitch",
            url: `https://www.twitch.tv/${username}`,
            category: "Gaming",
            status: "active"
          },
          {
            platform: "SoundCloud",
            url: `https://soundcloud.com/${username}`,
            category: "Music",
            status: "active"
          },
          {
            platform: "GitHub",
            url: `https://github.com/${username}`,
            category: "Professional",
            status: "active"
          },
          {
            platform: "VSCO",
            url: `https://vsco.co/${username}`,
            category: "Art",
            status: "active"
          },
          {
            platform: "GitHub Community",
            url: `https://github.community/u/${username}/summary`,
            category: "Online Community",
            status: "active"
          },
          {
            platform: "Spotify",
            url: `https://open.spotify.com/user/${username}`,
            category: "Music",
            status: "active"
          },
          {
            platform: "Patreon",
            url: `https://www.patreon.com/${username}`,
            category: "Online Community",
            status: "active"
          },
          // Additional links from the user's CSV data
          {
            platform: "Gravatar",
            url: `https://www.gravatar.com/avatar/undefined?s=1024`,
            category: "Online Community",
            status: "active"
          },
          {
            platform: "Viddler",
            url: `https://www.viddler.com/channel/${username}/`,
            category: "Video",
            status: "active"
          },
          // ... adding more profiles would be done here
        ];
        
        // Function to check for duplicate domains to avoid duplicates
        const isDuplicateDomain = (url: string, profiles: SocialMediaProfile[]): boolean => {
          const domain = new URL(url).hostname;
          return profiles.some(profile => {
            try {
              const profileDomain = new URL(profile.url).hostname;
              return domain === profileDomain;
            } catch (e) {
              return false;
            }
          });
        };
        
        // Filter out duplicates from newProfiles
        const filteredNewProfiles = newProfiles.filter(
          profile => !isDuplicateDomain(profile.url, [...profiles, ...additionalProfiles])
        );
        
        // Add the filtered new profiles to the existing ones
        profiles = [...profiles, ...filteredNewProfiles];
        
        // Check each profile URL and filter inactive ones
        const activeProfiles = await Promise.all(
          profiles.map(async profile => {
            const statusCheck = await checkUrlStatus(profile.url);
            
            // For Threads profiles specifically, we need to handle potential URL updates
            if (statusCheck.isActive && profile.platform === "Threads" && profile.url.includes("threads.net")) {
              return {
                ...profile,
                status: 'active' as 'active',
              };
            }
            
            return {
              ...profile,
              status: statusCheck.isActive ? 'active' as 'active' : 'inactive' as 'inactive',
              errorReason: statusCheck.errorReason
            };
          })
        );
        
        profiles = activeProfiles.filter(profile => profile.status === 'active');
        
        const domainResults = await checkDomainAvailability(username);
        setAvailableDomains(domainResults);
        
        // Simulate the completion of the search
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        const endTime = performance.now();
        const timeElapsed = Math.round(endTime - startTime);
        setSearchTime(timeElapsed);
        
        // Final check to make sure user hasn't bypassed limit
        if (hasReachedSearchLimit() || searchLimitReached) {
          setIsSearching(false);
          setShowLimitModal(true);
          return;
        }
        
        // Skip the separate verification step and do everything in one go
        try {
          // Use a single step for verification instead of showing multiple progress bars
          const verifiedProfiles = await deepVerifyProfiles(profiles);
          
          // Separate verified and unverified profiles
          const verified = verifiedProfiles.filter(profile => profile.verificationStatus !== 'error');
          const unverified = verifiedProfiles.filter(profile => profile.verificationStatus === 'error');
          
          setResults(verified);
          setUnverifiedResults(unverified);
          setAdditionalResults(additionalProfiles);
          const updatedCategorizedProfiles = groupProfilesByCategory(verified);
          setProfilesByCategory(updatedCategorizedProfiles);
          setCategories(getCategories(verified));
          
          // Update URL with the search query
          if (!location.pathname.includes('/search/')) {
            navigate(`/search/${encodeURIComponent(queryString)}`, { replace: true });
          }
          
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          
          // Save search history for logged in users
          if (user) {
            saveSearchHistory(queryString, verified.length)
              .then(success => {
                if (success) refreshProfile();
              });
          }
          
          setIsSearching(false);
          
          // Don't show any toast notifications for search completion
        } catch (error) {
          console.error("Verification error:", error);
          setIsSearching(false);
          
          // No toast notification for errors
        }
        
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
    }, 2500); // Slightly longer delay for a smoother experience
  };

  return {
    name,
    setName,
    results,
    additionalResults,
    unverifiedResults,
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
    setShowLimitModal,
    emailModalOpen,
    setEmailModalOpen,
    isDeepVerifying,
    verificationProgress
  };
};
