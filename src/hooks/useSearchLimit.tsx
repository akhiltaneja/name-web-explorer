
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSearchLimit = (user: any, profile: any) => {
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [checksRemaining, setChecksRemaining] = useState<number>(10); // Default to 10 searches
  const { toast } = useToast();
  
  // Track searches to prevent duplicates in the current session
  const [recentSearches, setRecentSearches] = useState<Set<string>>(new Set());

  // Initialize the limit state based on user authentication and profile
  useEffect(() => {
    if (user && profile) {
      // Authenticated user, use their profile data
      updateRemainingChecks(profile);
    } else if (!user) {
      // Guest user, check localStorage for limit
      checkGuestLimitStorage();
    }
  }, [user, profile]);

  // Update the remaining checks based on the user's profile
  const updateRemainingChecks = (profile: any) => {
    if (!profile) return;

    const now = new Date();
    
    if (profile.plan === 'unlimited') {
      setChecksRemaining(Infinity);
      setSearchLimitReached(false);
      return;
    }
    
    if (profile.plan === 'free') {
      // Daily limit of 10 checks for free users
      const today = new Date().toISOString().split('T')[0];
      const checksUsedToday = profile.checks_used % 10;
      
      setChecksRemaining(Math.max(10 - checksUsedToday, 0));
      setSearchLimitReached(checksUsedToday >= 10);
    } else if (profile.plan === 'premium') {
      // Monthly limit of 500 checks for premium users
      if (profile.plan_end_date && new Date(profile.plan_end_date) < now) {
        // Plan expired
        const checksUsedToday = profile.checks_used % 10;
        setChecksRemaining(Math.max(10 - checksUsedToday, 0));
        setSearchLimitReached(checksUsedToday >= 10);
      } else {
        // Active premium plan
        const checksUsedThisMonth = profile.checks_used % 500;
        setChecksRemaining(Math.max(500 - checksUsedThisMonth, 0));
        setSearchLimitReached(checksUsedThisMonth >= 500);
      }
    }
  };

  // Check if guest user has reached the daily limit
  const checkGuestLimitStorage = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('guestSearchLimit');
    
    if (storedData) {
      try {
        const { date, count, searches } = JSON.parse(storedData);
        
        if (date === today) {
          // Same day, count the searches
          const remainingSearches = Math.max(3 - count, 0);
          setChecksRemaining(remainingSearches);
          setGuestCheckAvailable(remainingSearches > 0);
          setSearchLimitReached(count >= 3);
          
          // Initialize recent searches set
          if (searches && Array.isArray(searches)) {
            setRecentSearches(new Set(searches));
          }
        } else {
          // New day, reset counter
          localStorage.setItem('guestSearchLimit', JSON.stringify({ 
            date: today, 
            count: 0,
            searches: []
          }));
          setChecksRemaining(3);
          setGuestCheckAvailable(true);
          setSearchLimitReached(false);
          setRecentSearches(new Set());
        }
      } catch (e) {
        // Invalid stored data, reset
        localStorage.setItem('guestSearchLimit', JSON.stringify({ 
          date: today, 
          count: 0,
          searches: []
        }));
        setChecksRemaining(3);
        setGuestCheckAvailable(true);
        setSearchLimitReached(false);
        setRecentSearches(new Set());
      }
    } else {
      // No stored data, initialize
      localStorage.setItem('guestSearchLimit', JSON.stringify({ 
        date: today, 
        count: 0,
        searches: []
      }));
      setChecksRemaining(3);
      setGuestCheckAvailable(true);
      setSearchLimitReached(false);
      setRecentSearches(new Set());
    }
  };

  // Increment the search count after a successful search
  // Return true if the search should be counted, false if it's a duplicate
  const incrementSearchCount = async (query: string): Promise<boolean> => {
    // Normalize the query by trimming and converting to lowercase
    const normalizedQuery = query.trim().toLowerCase();
    
    // Check if this is a duplicate search
    if (recentSearches.has(normalizedQuery)) {
      console.log("Duplicate search detected, not counting:", normalizedQuery);
      return true; // Allow the search but don't count it
    }
    
    // Double check the limit
    if (hasReachedSearchLimit()) {
      setSearchLimitReached(true);
      toast({
        title: "Search limit reached",
        description: user 
          ? "You've reached your daily search limit. Please upgrade your plan for more searches." 
          : "You've reached the guest search limit. Sign in or create an account for more searches.",
        variant: "destructive",
      });
      return false;
    }

    // Add to recent searches
    setRecentSearches(prev => {
      const updated = new Set(prev);
      updated.add(normalizedQuery);
      return updated;
    });

    if (user) {
      try {
        // Check if this search already exists for this user today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: existingSearch } = await supabase
          .from('searches')
          .select('*')
          .eq('user_id', user.id)
          .eq('query', normalizedQuery)
          .gte('created_at', today.toISOString())
          .maybeSingle();
        
        if (existingSearch) {
          console.log("This search was already performed today, not counting toward limit");
          return true; // Allow the search but don't count it in the limit
        }

        // Increment checks_used in the database
        const { error } = await supabase
          .from('profiles')
          .update({
            checks_used: (profile?.checks_used || 0) + 1,
          })
          .eq('id', user.id);

        if (error) {
          console.error("Error incrementing search count:", error);
          toast({
            title: "Error",
            description: "Failed to record your search. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        // Update local state
        updateRemainingChecks({
          ...profile,
          checks_used: (profile?.checks_used || 0) + 1,
        });

        // Check if they've now reached the limit
        if (profile?.plan === 'free' && checksRemaining <= 1) {
          toast({
            title: "Last search used",
            description: "You've used your last free search for today.",
            variant: "default", // Changed from "warning" to "default"
          });
        }

        return true;
      } catch (error) {
        console.error("Error incrementing search count:", error);
        return false;
      }
    } else {
      // For guest users, increment the localStorage count
      const today = new Date().toISOString().split('T')[0];
      const storedData = localStorage.getItem('guestSearchLimit');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          
          if (data.date === today) {
            // Check if this search is already in the list
            const searches = Array.isArray(data.searches) ? data.searches : [];
            if (searches.includes(normalizedQuery)) {
              console.log("Duplicate guest search detected, not counting");
              return true; // Allow search but don't count
            }
            
            // Same day, increment count
            const newCount = data.count + 1;
            const newSearches = [...searches, normalizedQuery];
            localStorage.setItem('guestSearchLimit', JSON.stringify({ 
              date: today, 
              count: newCount,
              searches: newSearches
            }));
            setChecksRemaining(Math.max(3 - newCount, 0));
            setGuestCheckAvailable(newCount < 3);
            setSearchLimitReached(newCount >= 3);
            
            if (newCount >= 3) {
              toast({
                title: "Guest limit reached",
                description: "Sign in or create an account for more searches.",
                variant: "default", // Changed from "warning" to "default"
              });
              return false;
            }
          } else {
            // New day, reset counter
            localStorage.setItem('guestSearchLimit', JSON.stringify({ 
              date: today, 
              count: 1,
              searches: [normalizedQuery]
            }));
            setChecksRemaining(2);
            setGuestCheckAvailable(true);
          }
        } catch (e) {
          // Invalid stored data, reset
          localStorage.setItem('guestSearchLimit', JSON.stringify({ 
            date: today, 
            count: 1,
            searches: [normalizedQuery]
          }));
          setChecksRemaining(2);
          setGuestCheckAvailable(true);
        }
      } else {
        // No stored data, initialize with count 1
        localStorage.setItem('guestSearchLimit', JSON.stringify({ 
          date: today, 
          count: 1,
          searches: [normalizedQuery]
        }));
        setChecksRemaining(2);
        setGuestCheckAvailable(true);
      }
      
      return true;
    }
  };

  // Check if the user has reached the search limit
  const hasReachedSearchLimit = (): boolean => {
    if (user) {
      // Authenticated user
      return checksRemaining <= 0 || searchLimitReached;
    } else {
      // Guest user
      return !guestCheckAvailable || checksRemaining <= 0;
    }
  };

  // Function to save search history for authenticated users
  const saveSearchHistory = async (query: string, resultCount: number): Promise<boolean> => {
    if (!user) return false;

    // Normalize the query
    const normalizedQuery = query.trim().toLowerCase();
    
    try {
      // Check if this search already exists for this user today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingSearch } = await supabase
        .from('searches')
        .select('*')
        .eq('user_id', user.id)
        .eq('query', normalizedQuery)
        .gte('created_at', today.toISOString())
        .maybeSingle();
      
      if (existingSearch) {
        console.log("This search was already performed today, updating result count");
        // Update the existing search with new result count if different
        if (existingSearch.result_count !== resultCount) {
          const { error } = await supabase
            .from('searches')
            .update({ result_count: resultCount })
            .eq('id', existingSearch.id);
          
          if (error) {
            console.error("Error updating search history:", error);
          }
        }
        return true;
      }
      
      // Insert new search record
      const { error } = await supabase
        .from('searches')
        .insert({
          user_id: user.id,
          query: normalizedQuery,
          result_count: resultCount
        });
      
      if (error) {
        console.error("Error saving search history:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving search history:", error);
      return false;
    }
  };

  // Function to clear search history
  const clearSearchHistory = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error clearing search history:", error);
        return false;
      }
      
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
