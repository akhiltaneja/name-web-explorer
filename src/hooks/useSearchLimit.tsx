
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const GUEST_LIMIT_KEY = "candidate_checker_guest_last_check";
const GUEST_COUNT_KEY = "candidate_checker_guest_check_count";
const GUEST_ID_KEY = "candidate_checker_guest_id";
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
  const { toast } = useToast();
  const guestId = generateUniqueId();

  useEffect(() => {
    if (!user) {
      checkAndUpdateGuestLimits();
    } else {
      setSearchLimitReached(hasReachedSearchLimit());
    }
  }, [user, profile]);

  const checkAndUpdateGuestLimits = () => {
    const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
    const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
    
    if (lastCheckTime) {
      const lastCheck = new Date(lastCheckTime);
      const now = new Date();
      const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheck < GUEST_COOLDOWN_HOURS) {
        // Within the 24-hour window, check if limit is reached
        if (checkCount >= FREE_PLAN_LIMIT) {
          setGuestCheckAvailable(false);
          setSearchLimitReached(true);
        } else {
          setGuestCheckAvailable(true);
          setSearchLimitReached(false);
        }
      } else {
        // Reset counter if 24 hours have passed
        localStorage.setItem(GUEST_COUNT_KEY, "0");
        localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
        setGuestCheckAvailable(true);
        setSearchLimitReached(false);
      }
    } else {
      // First time user
      localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      localStorage.setItem(GUEST_COUNT_KEY, "0");
      setGuestCheckAvailable(true);
      setSearchLimitReached(false);
    }
  };
  
  const hasReachedSearchLimit = () => {
    if (!user) {
      const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
      return checkCount >= FREE_PLAN_LIMIT;
    } else if (profile) {
      if (profile.plan === 'unlimited') return false;
      
      const dailyLimit = profile.plan === 'free' ? FREE_PLAN_LIMIT : 500;
      const checksUsed = profile.plan === 'free' 
        ? profile.checks_used % FREE_PLAN_LIMIT 
        : profile.checks_used % 500;
      
      return checksUsed >= dailyLimit;
    }
    return false;
  };

  const incrementSearchCount = () => {
    if (!user) {
      const currentCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
      
      // Check if already at or over limit
      if (currentCount >= FREE_PLAN_LIMIT) {
        setGuestCheckAvailable(false);
        setSearchLimitReached(true);
        return false;
      }
      
      const newCount = currentCount + 1;
      localStorage.setItem(GUEST_COUNT_KEY, String(newCount));
      localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      
      if (newCount >= FREE_PLAN_LIMIT) {
        setGuestCheckAvailable(false);
        setSearchLimitReached(true);
        toast({
          title: "Daily search limit reached",
          description: "You've reached your 3 daily free searches. Sign in or upgrade for more.",
          variant: "destructive",
        });
      }
      
      return true;
    }
    
    return true;
  };

  const saveSearchHistory = async (searchQuery: string, resultsCount: number) => {
    if (!user) return;
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          checks_used: (profile?.checks_used || 0) + 1 
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
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

  return { 
    guestCheckAvailable, 
    hasReachedSearchLimit: () => searchLimitReached || hasReachedSearchLimit(), 
    incrementSearchCount,
    saveSearchHistory
  };
};
