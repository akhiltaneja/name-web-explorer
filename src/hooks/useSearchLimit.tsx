
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Constants for search limit management
const GUEST_LIMIT_KEY = "people_peeper_guest_last_check";
const GUEST_COUNT_KEY = "people_peeper_guest_check_count";
const GUEST_ID_KEY = "people_peeper_guest_id";
const GUEST_COOLDOWN_HOURS = 24;
const FREE_PLAN_LIMIT = 3;
const GUEST_LIMIT_REACHED_KEY = "people_peeper_guest_limit_reached";

// Generate a unique ID for the device/browser
const generateUniqueId = () => {
  const existingId = localStorage.getItem(GUEST_ID_KEY);
  if (existingId) return existingId;
  
  // Create a unique ID based on browser and device info
  const navInfo = window.navigator.userAgent + window.navigator.language;
  const screenInfo = `${window.screen.height}x${window.screen.width}x${window.screen.colorDepth}`;
  const uniqueString = navInfo + screenInfo + new Date().getTime();
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const uniqueId = Math.abs(hash).toString(36);
  localStorage.setItem(GUEST_ID_KEY, uniqueId);
  return uniqueId;
};

export const useSearchLimit = (user: any, profile: any) => {
  // Initialize search limit reached from localStorage to maintain persistence across refreshes
  const initialLimitReached = user ? false : localStorage.getItem(GUEST_LIMIT_REACHED_KEY) === 'true';
  
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);
  const [searchLimitReached, setSearchLimitReached] = useState(initialLimitReached);
  const [checksRemaining, setChecksRemaining] = useState(0); // Start with 0 until we determine the actual count
  const { toast } = useToast();
  const guestId = generateUniqueId();

  // Set search limit reached to localStorage for persistence
  const setSearchLimitReachedWithStorage = (limitReached: boolean) => {
    setSearchLimitReached(limitReached);
    if (!user) {
      localStorage.setItem(GUEST_LIMIT_REACHED_KEY, limitReached.toString());
    }
  };

  // Initialize and check limits on component mount and when user/profile changes
  useEffect(() => {
    const checkAndSetLimits = () => {
      if (!user) {
        const limitStatus = checkGuestLimits();
        setSearchLimitReachedWithStorage(limitStatus.available === false);
        setChecksRemaining(limitStatus.remaining);
        setGuestCheckAvailable(limitStatus.available);
      } else if (profile) {
        const limitReached = hasReachedUserSearchLimit();
        setSearchLimitReachedWithStorage(limitReached);
        
        // Calculate remaining checks for user
        const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 
                          profile.plan === 'premium' ? 500 : Infinity;
        
        if (profile.plan === 'unlimited') {
          setChecksRemaining(Infinity);
        } else {
          const checksUsed = profile.checks_used || 0;
          const usedInCurrentPeriod = profile.plan === 'free' ? 
            (checksUsed % FREE_PLAN_LIMIT) : 
            (checksUsed % 500);
          
          const remaining = Math.max(0, dailyLimit - usedInCurrentPeriod);
          setChecksRemaining(remaining);
          
          // If no searches remaining, set the limit reached flag
          if (remaining <= 0) {
            setSearchLimitReachedWithStorage(true);
          }
        }
      }
    };

    checkAndSetLimits();
    
    // Also set up an interval to check periodically (to prevent bypasses)
    const intervalCheck = setInterval(checkAndSetLimits, 2000);
    return () => clearInterval(intervalCheck);
  }, [user, profile]);

  // Check guest limits and return status with remaining searches
  const checkGuestLimits = () => {
    const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
    const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
    
    if (lastCheckTime) {
      const lastCheck = new Date(lastCheckTime);
      const now = new Date();
      const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheck < GUEST_COOLDOWN_HOURS) {
        // Within the 24-hour window
        if (checkCount >= FREE_PLAN_LIMIT) {
          return { 
            available: false, 
            remaining: 0,
            hoursRemaining: Math.ceil(GUEST_COOLDOWN_HOURS - hoursSinceLastCheck)
          };
        } else {
          return { 
            available: true, 
            remaining: FREE_PLAN_LIMIT - checkCount,
            hoursRemaining: 0
          };
        }
      } else {
        // Reset counter if 24 hours have passed
        localStorage.setItem(GUEST_COUNT_KEY, "0");
        localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
        localStorage.setItem(GUEST_LIMIT_REACHED_KEY, 'false');
        return { 
          available: true, 
          remaining: FREE_PLAN_LIMIT,
          hoursRemaining: 0
        };
      }
    } else {
      // First time user
      localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      localStorage.setItem(GUEST_COUNT_KEY, "0");
      localStorage.setItem(GUEST_LIMIT_REACHED_KEY, 'false');
      return { 
        available: true, 
        remaining: FREE_PLAN_LIMIT,
        hoursRemaining: 0
      };
    }
  };
  
  // Check if a user has reached their search limit
  const hasReachedUserSearchLimit = () => {
    if (!profile) return false;
    
    if (profile.plan === 'unlimited') return false;
    
    const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 500;
    const checksUsed = profile.checks_used || 0;
    
    // For free plan, check per-day usage; for premium, check monthly usage
    const usedInCurrentPeriod = profile.plan === 'free' ? 
      (checksUsed % FREE_PLAN_LIMIT) : 
      (checksUsed % 500);
    
    return usedInCurrentPeriod >= dailyLimit;
  };
  
  // Check if overall search limit has been reached (guest or user)
  const hasReachedSearchLimit = () => {
    if (!user) {
      const guestStatus = checkGuestLimits();
      return !guestStatus.available;
    } else if (profile) {
      return hasReachedUserSearchLimit();
    }
    return false;
  };

  // Increment search count when a search is performed
  const incrementSearchCount = async () => {
    // Double check if limit is already reached to prevent any bypassing
    if (hasReachedSearchLimit() || checksRemaining <= 0) {
      setSearchLimitReachedWithStorage(true);
      
      if (!user) {
        const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
        if (lastCheckTime) {
          const lastCheck = new Date(lastCheckTime);
          const now = new Date();
          const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
          const hoursRemaining = Math.ceil(GUEST_COOLDOWN_HOURS - hoursSinceLastCheck);
          
          toast({
            title: "Request limit reached",
            description: `Please sign in or upgrade for more searches. Next free search available in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
            variant: "destructive",
            duration: 5000,
          });
        } else {
          toast({
            title: "Request limit reached",
            description: `Please sign in or upgrade for more searches.`,
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        toast({
          title: "Request limit reached",
          description: "Please upgrade to continue searching.",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return false;
    }
    
    if (!user) {
      // Handle guest search increment
      const currentCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
      const newCount = currentCount + 1;
      
      localStorage.setItem(GUEST_COUNT_KEY, String(newCount));
      localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      
      // Update the remaining checks
      const remaining = Math.max(0, FREE_PLAN_LIMIT - newCount);
      setChecksRemaining(remaining);
      
      // If this search puts us at the limit, set the flag
      if (remaining <= 0) {
        setGuestCheckAvailable(false);
        setSearchLimitReachedWithStorage(true);
        localStorage.setItem(GUEST_LIMIT_REACHED_KEY, 'true');
      }
      
      return true;
    } else if (profile) {
      // For logged-in users
      if (profile.plan === 'unlimited') return true;
      
      const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 500;
      const checksUsed = profile.checks_used || 0;
      
      // Calculate usage in current period
      const usedInCurrentPeriod = profile.plan === 'free' ? 
        (checksUsed % FREE_PLAN_LIMIT) : 
        (checksUsed % 500);
      
      if (usedInCurrentPeriod >= dailyLimit) {
        setSearchLimitReachedWithStorage(true);
        setChecksRemaining(0);
        
        toast({
          title: "Request limit reached",
          description: `You've reached your ${profile.plan} plan limit. Please upgrade for more searches.`,
          variant: "destructive",
          duration: 5000,
        });
        
        return false;
      }
      
      // Update the remaining checks (will be formally updated in saveSearchHistory)
      const remaining = Math.max(0, dailyLimit - usedInCurrentPeriod - 1);
      setChecksRemaining(remaining);
      
      // If this search puts us at the limit, set the flag
      if (remaining <= 0) {
        setSearchLimitReachedWithStorage(true);
      }
      
      return true;
    }
    
    return false;
  };

  // Save search history and update profile check count
  const saveSearchHistory = async (searchQuery: string, resultsCount: number) => {
    if (!user) return true;
    
    try {
      // Update the user's check count
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          checks_used: (profile?.checks_used || 0) + 1 
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Save the search to history
      const { error: searchError } = await supabase
        .from('searches')
        .insert({
          user_id: user.id,
          query: searchQuery,
          result_count: resultsCount
        });
      
      if (searchError) throw searchError;
      
      return true;
    } catch (error) {
      console.error("Error saving search:", error);
      return false;
    }
  };

  // Clear search history for a user
  const clearSearchHistory = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error clearing search history:", error);
      return false;
    }
  };

  return { 
    guestCheckAvailable,
    searchLimitReached,
    setSearchLimitReached: setSearchLimitReachedWithStorage,
    checksRemaining,
    hasReachedSearchLimit,
    incrementSearchCount,
    saveSearchHistory,
    clearSearchHistory
  };
};
