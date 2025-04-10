
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const GUEST_LIMIT_KEY = "candidate_checker_guest_last_check";
const GUEST_COUNT_KEY = "candidate_checker_guest_check_count";
const GUEST_COOLDOWN_HOURS = 24;
const FREE_PLAN_LIMIT = 3;

export const useSearchLimit = (user: any, profile: any) => {
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);

  useEffect(() => {
    if (!user) {
      checkAndUpdateGuestLimits();
    }
  }, [user]);

  const checkAndUpdateGuestLimits = () => {
    const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
    const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
    
    if (lastCheckTime) {
      const lastCheck = new Date(lastCheckTime);
      const now = new Date();
      const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCheck < GUEST_COOLDOWN_HOURS) {
        if (checkCount >= FREE_PLAN_LIMIT) {
          setGuestCheckAvailable(false);
        } else {
          setGuestCheckAvailable(true);
        }
      } else {
        // Reset counter if 24 hours have passed
        localStorage.setItem(GUEST_COUNT_KEY, "0");
        setGuestCheckAvailable(true);
      }
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
      const newCount = currentCount + 1;
      localStorage.setItem(GUEST_COUNT_KEY, String(newCount));
      localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
      
      if (newCount >= FREE_PLAN_LIMIT) {
        setGuestCheckAvailable(false);
      }
    }
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
    hasReachedSearchLimit, 
    incrementSearchCount,
    saveSearchHistory
  };
};
