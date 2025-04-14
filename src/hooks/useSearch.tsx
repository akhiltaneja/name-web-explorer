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

const MAX_RECENT_SEARCHES = 5;

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
        if (!hasReachedSearchLimit() && checksRemaining > 0) {
          handleSearch(searchQuery);
        } else {
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
    const queryString = String(searchQuery);
    
    if (!queryString?.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

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

    const canProceed = await incrementSearchCount();
    if (!canProceed) {
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    const startTime = performance.now();
    
    const nameParts = queryString.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        const increment = Math.max(5 - Math.floor(prev / 20), 1) * 0.8;
        const newProgress = prev + increment;
        return newProgress < 95 ? newProgress : 95;
      });
    }, 400);
    
    setTimeout(async () => {
      try {
        if (hasReachedSearchLimit() || searchLimitReached) {
          clearInterval(progressInterval);
          setIsSearching(false);
          setShowLimitModal(true);
          return;
        }
        
        let profiles = getSocialMediaProfiles(username, queryString);
        let additionalProfiles = getAdditionalResults(username, queryString);
        
        const newProfiles: SocialMediaProfile[] = [
          {
            platform: "Twitch",
            url: `https://www.twitch.tv/${username}`,
            username: username,
            icon: "twitch",
            color: "#9146FF",
            category: "Gaming",
            status: "active"
          },
          {
            platform: "SoundCloud",
            url: `https://soundcloud.com/${username}`,
            username: username,
            icon: "soundcloud",
            color: "#FF5500",
            category: "Music",
            status: "active"
          },
          {
            platform: "GitHub",
            url: `https://github.com/${username}`,
            username: username,
            icon: "github",
            color: "#181717",
            category: "Professional",
            status: "active"
          },
          {
            platform: "VSCO",
            url: `https://vsco.co/${username}`,
            username: username,
            icon: "vsco",
            color: "#000000",
            category: "Art",
            status: "active"
          },
          {
            platform: "GitHub Community",
            url: `https://github.community/u/${username}/summary`,
            username: username,
            icon: "github",
            color: "#181717",
            category: "Online Community",
            status: "active"
          },
          {
            platform: "Spotify",
            url: `https://open.spotify.com/user/${username}`,
            username: username,
            icon: "spotify",
            color: "#1DB954",
            category: "Music",
            status: "active"
          },
          {
            platform: "Patreon",
            url: `https://www.patreon.com/${username}`,
            username: username,
            icon: "patreon",
            color: "#F96854",
            category: "Online Community",
            status: "active"
          },
          {
            platform: "Telegram",
            url: `https://t.me/${username}`,
            username: username,
            icon: "telegram",
            color: "#0088cc",
            category: "Messaging",
            status: "active"
          },
          {
            platform: "Flickr",
            url: `https://www.flickr.com/search/?text=${encodeURIComponent(queryString)}`,
            username: queryString,
            icon: "flickr",
            color: "#0063dc",
            category: "Art",
            status: "active"
          }
        ];
        
        const isDuplicateDomain = (url: string, profiles: SocialMediaProfile[]): boolean => {
          try {
            const domain = new URL(url).hostname;
            return profiles.some(profile => {
              try {
                const profileDomain = new URL(profile.url).hostname;
                return domain === profileDomain;
              } catch (e) {
                return false;
              }
            });
          } catch (e) {
            return false;
          }
        };
        
        const filteredNewProfiles = newProfiles.filter(
          profile => !isDuplicateDomain(profile.url, [...profiles, ...additionalProfiles])
        );
        
        profiles = [...profiles, ...filteredNewProfiles];
        
        const activeProfiles = await Promise.all(
          profiles.map(async profile => {
            const statusCheck = await checkUrlStatus(profile.url);
            
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
        
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        const endTime = performance.now();
        const timeElapsed = Math.round(endTime - startTime);
        setSearchTime(timeElapsed);
        
        if (hasReachedSearchLimit() || searchLimitReached) {
          setIsSearching(false);
          setShowLimitModal(true);
          return;
        }
        
        try {
          setResults(profiles);
          setAdditionalResults(additionalProfiles);
          const updatedCategorizedProfiles = groupProfilesByCategory(profiles);
          setProfilesByCategory(updatedCategorizedProfiles);
          setCategories(getCategories(profiles));
          
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
          
          setIsSearching(false);
        } catch (error) {
          console.error("Verification error:", error);
          setIsSearching(false);
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
    }, 2500);
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
