
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
} from "@/utils/socialMediaSearch";
import { useSearchLimit } from "./useSearchLimit";
import { SocialMediaProfile } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const MAX_RECENT_SEARCHES = 5;

// Function to get or generate an anonymous user identifier
const getGuestIdentifier = () => {
  let identifier = localStorage.getItem('guest_identifier');
  if (!identifier) {
    identifier = uuidv4();
    localStorage.setItem('guest_identifier', identifier);
  }
  return identifier;
};

// Track anonymous user activity in the database
const trackAnonUserSearch = async (identifier: string, query: string, resultCount: number) => {
  try {
    // Normalize the query
    const normalizedQuery = query.trim().toLowerCase();

    // First check if this search already exists for this anonymous user today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingSearch } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', 'anon_' + identifier)
      .eq('query', normalizedQuery)
      .gte('created_at', today.toISOString())
      .maybeSingle();
      
    if (existingSearch) {
      console.log("Anon user already performed this search today, updating result count");
      // Update the existing search with new result count if different
      if (existingSearch.result_count !== resultCount) {
        await supabase
          .from('searches')
          .update({ result_count: resultCount })
          .eq('id', existingSearch.id);
      }
      return;
    }
    
    // First check if this anonymous user exists
    const { data, error } = await supabase
      .from('anon_users')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking anon user:", error);
      return;
    }
    
    if (!data) {
      // Create new anonymous user
      await supabase.from('anon_users').insert({
        identifier: identifier,
        search_count: 1,
        last_seen: new Date().toISOString()
      });
    } else {
      // Update existing anonymous user
      await supabase
        .from('anon_users')
        .update({ 
          last_seen: new Date().toISOString(),
          search_count: data.search_count + 1
        })
        .eq('id', data.id);
    }
    
    // Record the search in the searches table with a special user_id for anonymous users
    await supabase
      .from('searches')
      .insert({
        user_id: 'anon_' + identifier, // We prefix with 'anon_' to identify this as an anonymous user
        query: normalizedQuery,
        result_count: resultCount
      });
  } catch (error) {
    console.error("Error tracking anonymous user:", error);
  }
};

export const useSearch = (user: any, profile: any, refreshProfile: () => void) => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [additionalResults, setAdditionalResults] = useState<SocialMediaProfile[]>([]);
  const [unverifiedResults, setUnverifiedResults] = useState<SocialMediaProfile[]>([]); // Add unverifiedResults state
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [profilesByCategory, setProfilesByCategory] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [guestIdentifier, setGuestIdentifier] = useState("");
  const [isDeepVerifying, setIsDeepVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchInitiated = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isSearchInProgress = useRef(false);
  
  const { 
    guestCheckAvailable, 
    searchLimitReached,
    setSearchLimitReached, 
    checksRemaining,
    hasReachedSearchLimit, 
    incrementSearchCount,
    saveSearchHistory
  } = useSearchLimit(user, profile);

  // Initialize guest identifier
  useEffect(() => {
    if (!user) {
      const identifier = getGuestIdentifier();
      setGuestIdentifier(identifier);
    }
  }, [user]);

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
    // Prevent duplicate searches
    if (isSearchInProgress.current) {
      console.log("Search already in progress, ignoring duplicate request");
      return;
    }
    
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

    // Set flag to prevent duplicate searches
    isSearchInProgress.current = true;

    // Pass the query to incrementSearchCount to check for duplicates
    const canProceed = await incrementSearchCount(queryString);
    if (!canProceed) {
      isSearchInProgress.current = false;
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
          isSearchInProgress.current = false;
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
          isSearchInProgress.current = false;
          return;
        }
        
        try {
          setResults(profiles);
          setAdditionalResults(additionalProfiles);
          setUnverifiedResults(unverifiedResults); // Add unverifiedResults to state
          const updatedCategorizedProfiles = groupProfilesByCategory(profiles);
          setProfilesByCategory(updatedCategorizedProfiles);
          setCategories(getCategories(profiles));
          
          if (!location.pathname.includes('/search/')) {
            navigate(`/search/${encodeURIComponent(queryString)}`, { replace: true });
          }
          
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          
          // Record search data based on user type
          if (user) {
            // Authenticated user - save to their history
            // Only record the search history once, don't increment the count again
            saveSearchHistory(queryString, profiles.length)
              .then(success => {
                if (success) refreshProfile();
              });
          } else {
            // Anonymous user - track in anon_users and searches tables
            // This is now handled with duplicate detection
            trackAnonUserSearch(guestIdentifier, queryString, profiles.length);
          }
          
          setIsSearching(false);
          // Reset the search in progress flag
          isSearchInProgress.current = false;
        } catch (error) {
          console.error("Verification error:", error);
          setIsSearching(false);
          isSearchInProgress.current = false;
        }
      } catch (error) {
        console.error("Search error:", error);
        clearInterval(progressInterval);
        setIsSearching(false);
        isSearchInProgress.current = false;
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
    unverifiedResults, // Export unverifiedResults
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
