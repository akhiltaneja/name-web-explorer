
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SocialResultCard from "@/components/SocialResultCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, ExternalLink, Filter, Grid, List, Download, Copy, User, LogIn } from "lucide-react";
import { getSocialMediaProfiles, getCategories } from "@/utils/socialMediaSearch";
import { SocialMediaProfile, SocialMediaCategory } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<SocialMediaCategory[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (results.length > 0) {
      setCategories(getCategories(results));
    }
  }, [results]);

  const handleSearch = async () => {
    if (!name.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the search feature.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Check usage limits
    if (profile) {
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
      
      // Save search to database if user is logged in
      if (user) {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
                Candidate Checker
              </h1>
              <p className="text-lg text-gray-400">
                Find social media profiles for candidates with a simple search
              </p>
            </div>
            
            {user ? (
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>

          <Card className="mb-8 shadow-lg bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter first and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching}
                  className="md:w-auto w-full"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
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
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  Results for {name}
                  <span className="text-sm font-normal bg-blue-900/30 text-blue-300 py-0.5 px-2 rounded-full border border-blue-800">
                    {filteredResults.length} found
                  </span>
                </h2>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
                  >
                    {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
                  </Button>
                  
                  <Button 
                    variant={selectedCategory ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={`${!selectedCategory ? 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-800' : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white'}`}
                  >
                    <Filter size={14} className="mr-1" />
                    All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyAll}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
                  >
                    <Copy size={14} className="mr-1" />
                    Copy All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadReport}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
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
                      className={selectedCategory === category.name ? "" : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"}
                    >
                      {category.name}
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                        {category.count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              <Separator className="bg-gray-700" />

              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredResults.map((profile, index) => (
                  <SocialResultCard key={index} profile={profile} />
                ))}
              </div>

              <div className="mt-8 text-center text-sm text-gray-400">
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
