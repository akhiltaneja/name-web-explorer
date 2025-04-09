
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SocialResultCard from "@/components/SocialResultCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, ExternalLink, Filter, Grid, List, Download, Copy } from "lucide-react";
import { getSocialMediaProfiles, getCategories } from "@/utils/socialMediaSearch";
import { SocialMediaProfile, SocialMediaCategory } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

const GUEST_LIMIT_KEY = "candidate_checker_guest_last_check";
const GUEST_COUNT_KEY = "candidate_checker_guest_check_count";
const GUEST_COOLDOWN_HOURS = 12;

const Index = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<SocialMediaCategory[]>([]);
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (results.length > 0) {
      setCategories(getCategories(results));
    }
  }, [results]);

  useEffect(() => {
    // Check if guest search is available
    if (!user) {
      const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
      const checkCount = localStorage.getItem(GUEST_COUNT_KEY);
      
      if (lastCheckTime) {
        const lastCheck = new Date(lastCheckTime);
        const now = new Date();
        const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastCheck < GUEST_COOLDOWN_HOURS && Number(checkCount) >= 1) {
          setGuestCheckAvailable(false);
        } else if (hoursSinceLastCheck >= GUEST_COOLDOWN_HOURS) {
          // Reset after cooldown period
          localStorage.setItem(GUEST_COUNT_KEY, "0");
          setGuestCheckAvailable(true);
        }
      }
    }
  }, [user]);

  const handleSearch = async () => {
    if (!name.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    // Check if guest user reached limit
    if (!user) {
      const checkCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
      
      if (checkCount >= 1) {
        const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
        
        if (lastCheckTime) {
          const lastCheck = new Date(lastCheckTime);
          const now = new Date();
          const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastCheck < GUEST_COOLDOWN_HOURS) {
            const hoursRemaining = Math.ceil(GUEST_COOLDOWN_HOURS - hoursSinceLastCheck);
            
            toast({
              title: "Search limit reached",
              description: `Please sign in to continue searching or wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
              variant: "destructive",
            });
            
            return;
          }
        }
      }
    } else if (profile) {
      // Check usage limits for logged in users
      const dailyLimit = profile.plan === 'free' ? 5 : profile.plan === 'premium' ? 500 : Infinity;
      const checksUsed = profile.checks_used % (profile.plan === 'free' ? 5 : 500);
      
      if (checksUsed >= dailyLimit && profile.plan !== 'unlimited') {
        toast({
          title: "Usage limit reached",
          description: `You've reached your ${profile.plan} plan limit. Please upgrade for more searches.`,
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }
    }

    setIsSearching(true);
    
    // Create a username from the name
    const nameParts = name.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    // Get social media profiles
    const profiles = getSocialMediaProfiles(username, name);
    
    // Simulate async search with a timeout
    setTimeout(async () => {
      setResults(profiles);
      setSelectedCategory(null);
      setIsSearching(false);
      
      toast({
        title: "Search complete",
        description: `Found ${profiles.length} potential profiles for ${name}`,
      });
      
      // Update for guest user
      if (!user) {
        const currentCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
        localStorage.setItem(GUEST_COUNT_KEY, String(currentCount + 1));
        localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
        
        if (currentCount + 1 >= 1) {
          setGuestCheckAvailable(false);
        }
      } else {
        // Save search to database if user is logged in
        try {
          // Increment checks_used count
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              checks_used: (profile?.checks_used || 0) + 1 
            })
            .eq('id', user.id);
          
          if (profileError) throw profileError;
          
          // Save search history
          const { error: searchError } = await supabase
            .from('searches')
            .insert({
              user_id: user.id,
              query: name,
              result_count: profiles.length
            });
          
          if (searchError) throw searchError;
          
          // Refresh profile to get updated checks_used
          refreshProfile();
          
        } catch (error) {
          console.error("Error saving search:", error);
        }
      }
    }, 1500);
  };

  const handleCopyAll = () => {
    const text = filteredResults
      .map(profile => `${profile.platform}: ${profile.url}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard",
      description: `All ${filteredResults.length} URLs have been copied`,
    });
  };

  const handleDownloadReport = () => {
    const csvHeaders = ["Platform", "URL", "Username", "Category", "Status"];
    const csvRows = filteredResults.map(profile => [
      profile.platform,
      profile.url,
      profile.username,
      profile.category || "",
      profile.status || ""
    ]);
    
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${name.replace(/\s+/g, "_")}_profiles.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report downloaded",
      description: `${filteredResults.length} profiles saved to CSV`,
    });
  };

  const filteredResults = selectedCategory 
    ? results.filter(profile => profile.category === selectedCategory)
    : results;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Candidate Checker
            </h1>
            <p className="text-lg text-gray-600">
              Find social media profiles for candidates with a simple search
            </p>

            {!user && !guestCheckAvailable && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  You've used your guest search. <Link to="/auth" className="font-bold underline">Sign in</Link> to continue searching (5 searches per day with a free account).
                </p>
              </div>
            )}
          </div>

          <Card className="mb-8 shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter first and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 border-gray-300 text-gray-900 placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || (!user && !guestCheckAvailable)}
                  className="md:w-auto w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search size={18} />
                      <span>Search</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
                  Results for {name}
                  <span className="text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full border border-blue-200">
                    {filteredResults.length} found
                  </span>
                </h2>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
                  </Button>
                  
                  <Button 
                    variant={selectedCategory ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={`${!selectedCategory ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                  >
                    <Filter size={14} className="mr-1" />
                    All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyAll}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    <Copy size={14} className="mr-1" />
                    Copy All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadReport}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-4">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                      className={selectedCategory === category.name ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-100 text-gray-700"}
                    >
                      {category.name}
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {category.count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              <Separator className="bg-gray-200" />

              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredResults.map((profile, index) => (
                  <SocialResultCard key={index} profile={profile} />
                ))}
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p className="flex items-center justify-center gap-1">
                  <ExternalLink size={14} />
                  Links will open in a new tab
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
