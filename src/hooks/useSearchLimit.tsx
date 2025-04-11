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
        // Guest user logic
        const limitStatus = checkGuestLimits();
        setSearchLimitReachedWithStorage(limitStatus.available === false);
        setChecksRemaining(limitStatus.remaining);
        setGuestCheckAvailable(limitStatus.available);
        
        // Reset the "has shown grade dialog" flag at midnight UTC
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setUTCHours(24, 0, 0, 0);
        const msTillMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
          localStorage.removeItem('has_shown_grade_dialog_today');
        }, msTillMidnight);
      } else if (profile) {
        // Special handling for admin user - unlimited searches
        if (profile.email === "akhiltaneja92@gmail.com") {
          setChecksRemaining(Infinity);
          setSearchLimitReachedWithStorage(false);
          return;
        }
        
        // Logged in user logic
        const limitReached = hasReachedUserSearchLimit();
        setSearchLimitReachedWithStorage(limitReached);
        
        // Calculate remaining checks for user
        const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 
                          profile.plan === 'premium' ? 500 : Infinity;
        
        if (profile.plan === 'unlimited') {
          setChecksRemaining(Infinity);
        } else {
          const checksUsed = profile.checks_used || 0;
          
          // For free plan, check daily usage
          if (profile.plan === 'free') {
            // Get today's date in UTC
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayUTC = today.toISOString().split('T')[0];
            
            // Count searches made today
            supabase
              .from('searches')
              .select('count', { count: 'exact' })
              .eq('user_id', user.id)
              .gte('created_at', todayUTC)
              .then(({ count, error }) => {
                if (!error && count !== null) {
                  const searchesToday = count;
                  const remaining = Math.max(0, FREE_PLAN_LIMIT - searchesToday);
                  setChecksRemaining(remaining);
                  
                  if (remaining <= 0) {
                    setSearchLimitReachedWithStorage(true);
                  }
                }
              });
          } else {
            // For premium plan, check monthly usage
            const usedInCurrentPeriod = checksUsed % 500;
            const remaining = Math.max(0, dailyLimit - usedInCurrentPeriod);
            setChecksRemaining(remaining);
            
            if (remaining <= 0) {
              setSearchLimitReachedWithStorage(true);
            }
          }
        }
      }
    };

    checkAndSetLimits();
  }, [user, profile]);

  // Check guest limits and return status with remaining searches
  const checkGuestLimits = () => {
    const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
    const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
    
    if (lastCheckTime) {
      const lastCheck = new Date(lastCheckTime);
      const now = new Date();
      const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
      
      // Check if 24 hours have passed since the first search
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
    
    // Special handling for admin user - unlimited searches
    if (profile.email === "akhiltaneja92@gmail.com") {
      return false;
    }
    
    if (profile.plan === 'unlimited') return false;
    
    if (profile.plan === 'free') {
      // For free plan, get today's searches from Supabase
      // This function is async, so we'll rely on the useEffect to set the state
      return checksRemaining <= 0;
    } else if (profile.plan === 'premium') {
      const dailyLimit = 500;
      const checksUsed = profile.checks_used || 0;
      const usedInCurrentPeriod = checksUsed % 500;
      return usedInCurrentPeriod >= dailyLimit;
    }
    
    return false;
  };
  
  // Check if overall search limit has been reached (guest or user)
  const hasReachedSearchLimit = () => {
    if (!user) {
      const guestStatus = checkGuestLimits();
      return !guestStatus.available;
    } else if (profile) {
      // Special handling for admin user - unlimited searches
      if (profile.email === "akhiltaneja92@gmail.com") {
        return false;
      }
      
      return hasReachedUserSearchLimit();
    }
    return false;
  };

  // Increment search count when a search is performed
  const incrementSearchCount = async () => {
    // Special handling for admin user - always allow searches
    if (profile && profile.email === "akhiltaneja92@gmail.com") {
      return true;
    }
    
    // Double check if limit is already reached to prevent any bypassing
    if (hasReachedSearchLimit() || searchLimitReached || checksRemaining <= 0) {
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
      
      // Only update timestamp on first search to establish the 24-hour window
      if (currentCount === 0) {
        localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      }
      
      // Update the remaining checks
      const remaining = Math.max(0, FREE_PLAN_LIMIT - newCount);
      setChecksRemaining(remaining);
      
      // If this search puts us at the limit, set the flag
      if (newCount >= FREE_PLAN_LIMIT) {
        setGuestCheckAvailable(false);
        setSearchLimitReachedWithStorage(true);
      }
      
      return true;
    } else if (profile) {
      // For logged-in users
      if (profile.plan === 'unlimited') return true;
      
      // Update checks_used in profile
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ checks_used: (profile.checks_used || 0) + 1 })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        // For free plan users, check if they've reached their daily limit
        if (profile.plan === 'free') {
          // Get today's date in UTC
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayUTC = today.toISOString().split('T')[0];
          
          // Count searches made today (including this one)
          const { count, error } = await supabase
            .from('searches')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id)
            .gte('created_at', todayUTC);
          
          if (!error && count !== null) {
            const searchesToday = count + 1; // +1 for the current search
            const remaining = Math.max(0, FREE_PLAN_LIMIT - searchesToday);
            setChecksRemaining(remaining);
            
            if (remaining <= 0) {
              setSearchLimitReachedWithStorage(true);
              
              toast({
                title: "Request limit reached",
                description: `You've reached your daily limit of ${FREE_PLAN_LIMIT} searches. Please upgrade for more searches or try again tomorrow.`,
                variant: "destructive",
                duration: 5000,
              });
              
              return false;
            }
          }
        } else if (profile.plan === 'premium') {
          // For premium users
          const dailyLimit = 500;
          const checksUsed = (profile.checks_used || 0) + 1; // +1 for this search
          const usedInCurrentPeriod = checksUsed % 500;
          const remaining = Math.max(0, dailyLimit - usedInCurrentPeriod);
          
          setChecksRemaining(remaining);
          
          if (remaining <= 0) {
            setSearchLimitReachedWithStorage(true);
            
            toast({
              title: "Request limit reached",
              description: `You've reached your monthly limit of ${dailyLimit} searches. Please upgrade for unlimited searches.`,
              variant: "destructive",
              duration: 5000,
            });
            
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error("Error updating profile check count:", error);
        return false;
      }
    }
    
    return false;
  };

  // Save search history and update profile check count
  const saveSearchHistory = async (searchQuery: string, resultsCount: number) => {
    if (!user) return true;
    
    try {
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
