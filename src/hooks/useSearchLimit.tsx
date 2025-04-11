
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GUEST_LIMIT_KEY = "people_peeper_guest_last_check";
const GUEST_COUNT_KEY = "people_peeper_guest_check_count";
const GUEST_ID_KEY = "people_peeper_guest_id";
const GUEST_COOLDOWN_HOURS = 24;
const FREE_PLAN_LIMIT = 3;

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
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [checksRemaining, setChecksRemaining] = useState(FREE_PLAN_LIMIT);
  const { toast } = useToast();
  const guestId = generateUniqueId();

  // Initialize and check limits on component mount and when user/profile changes
  useEffect(() => {
    if (!user) {
      const limitStatus = checkGuestLimits();
      setSearchLimitReached(!limitStatus.available);
      setChecksRemaining(limitStatus.remaining);
    } else if (profile) {
      const limitReached = hasReachedUserSearchLimit();
      setSearchLimitReached(limitReached);
      
      // Calculate remaining checks for user
      const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 
                        profile.plan === 'premium' ? 500 : Infinity;
      
      if (profile.plan === 'unlimited') {
        setChecksRemaining(Infinity);
      } else {
        const checksUsed = profile.plan === 'free' ? 
          (profile.checks_used % FREE_PLAN_LIMIT) : 
          (profile.checks_used % 500);
        
        const remaining = Math.max(0, dailyLimit - checksUsed);
        setChecksRemaining(remaining);
        
        // If no searches remaining, set the limit reached flag
        if (remaining <= 0) {
          setSearchLimitReached(true);
        }
      }
    }
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
          setGuestCheckAvailable(false);
          return { 
            available: false, 
            remaining: 0,
            hoursRemaining: Math.ceil(GUEST_COOLDOWN_HOURS - hoursSinceLastCheck)
          };
        } else {
          setGuestCheckAvailable(true);
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
        setGuestCheckAvailable(true);
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
      setGuestCheckAvailable(true);
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
    const checksUsed = profile.plan === 'free' 
      ? (profile.checks_used % FREE_PLAN_LIMIT) 
      : (profile.checks_used % 500);
    
    return checksUsed >= dailyLimit;
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
      setSearchLimitReached(true);
      
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
          });
        }
      } else {
        toast({
          title: "Request limit reached",
          description: "Please upgrade to continue searching.",
          variant: "destructive",
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
        setSearchLimitReached(true);
      }
      
      return true;
    } else if (profile) {
      // For logged-in users
      if (profile.plan === 'unlimited') return true;
      
      const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 500;
      const checksUsed = profile.plan === 'free' 
        ? (profile.checks_used % FREE_PLAN_LIMIT) 
        : (profile.checks_used % 500);
      
      if (checksUsed >= dailyLimit) {
        setSearchLimitReached(true);
        setChecksRemaining(0);
        
        toast({
          title: "Request limit reached",
          description: `You've reached your ${profile.plan} plan limit. Please upgrade for more searches.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      // Update the remaining checks (will be formally updated in saveSearchHistory)
      const remaining = Math.max(0, dailyLimit - checksUsed - 1);
      setChecksRemaining(remaining);
      
      // If this search puts us at the limit, set the flag
      if (remaining <= 0) {
        setSearchLimitReached(true);
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
    setSearchLimitReached,
    checksRemaining,
    hasReachedSearchLimit,
    incrementSearchCount,
    saveSearchHistory,
    clearSearchHistory
  };
};
