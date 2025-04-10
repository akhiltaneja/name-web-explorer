
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SocialResultCard from "@/components/SocialResultCard";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  ExternalLink, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Copy, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Globe,
  Lock
} from "lucide-react";
import { getSocialMediaProfiles, getCategories, getAdditionalResults, groupProfilesByCategory, checkUrlStatus, checkDomainAvailability } from "@/utils/socialMediaSearch";
import { SocialMediaProfile, SocialMediaCategory } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { downloadTextReport, emailTextReport } from "@/utils/reportGenerator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import EmailReportDialog from "@/components/EmailReportDialog";
import { Progress } from "@/components/ui/progress";
import DefaultAvatar from "@/components/DefaultAvatar";
import DomainSuggestions from "@/components/DomainSuggestions";

const GUEST_LIMIT_KEY = "candidate_checker_guest_last_check";
const GUEST_COUNT_KEY = "candidate_checker_guest_check_count";
const GUEST_COOLDOWN_HOURS = 24;
const FREE_PLAN_LIMIT = 3;

const Index = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [additionalResults, setAdditionalResults] = useState<SocialMediaProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<SocialMediaCategory[]>([]);
  const [guestCheckAvailable, setGuestCheckAvailable] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [profilesByCategory, setProfilesByCategory] = useState<Record<string, SocialMediaProfile[]>>({});
  const [availableDomains, setAvailableDomains] = useState<{tld: string, available: boolean, price: number}[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInitiated = useRef(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

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
        handleSearch(searchQuery);
      }
    }
    
    const state = location.state as { returnTo?: string; action?: string } | null;
    if (state?.action === "emailReport" && user) {
      setEmailModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      setCategories(getCategories(results));
      setProfilesByCategory(groupProfilesByCategory(results));
    }
  }, [results]);

  useEffect(() => {
    if (!user) {
      checkAndUpdateGuestLimits();
    }
  }, [user]);
  
  // New function to properly check and update guest limits
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
  
  // Check if the user has reached their search limit
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

  const handleSearch = async (searchQuery = name) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    // Check search limit
    if (hasReachedSearchLimit()) {
      if (!user) {
        const lastCheckTime = localStorage.getItem(GUEST_LIMIT_KEY);
        
        if (lastCheckTime) {
          const lastCheck = new Date(lastCheckTime);
          const now = new Date();
          const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
          const hoursRemaining = Math.ceil(GUEST_COOLDOWN_HOURS - hoursSinceLastCheck);
          
          toast({
            title: "Search limit reached",
            description: `Please sign in to continue searching or wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Usage limit reached",
          description: `You've reached your ${profile?.plan} plan limit. Please upgrade for more searches.`,
          variant: "destructive",
        });
        navigate("/profile");
      }
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    const startTime = performance.now();
    
    const nameParts = searchQuery.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        const newProgress = prev + (Math.random() * 15);
        return newProgress < 90 ? newProgress : prev;
      });
    }, 200);
    
    setTimeout(async () => {
      let profiles = getSocialMediaProfiles(username, searchQuery);
      const additionalProfiles = getAdditionalResults(username, searchQuery);
      
      const activeProfiles = await Promise.all(
        profiles.map(async profile => {
          const isActive = await checkUrlStatus(profile.url);
          return {
            ...profile,
            status: isActive ? 'active' : 'inactive'
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
      
      setTimeout(() => {
        setResults(profiles);
        setAdditionalResults(additionalProfiles);
        setProfilesByCategory(groupProfilesByCategory(profiles));
        setSelectedCategory(null);
        setIsSearching(false);
        
        toast({
          title: "Search complete",
          description: `Found ${profiles.length} potential profiles for ${searchQuery}`,
        });
        
        // Update URL with the search query
        if (!location.pathname.includes('/search/')) {
          navigate(`/search/${encodeURIComponent(searchQuery)}`, { replace: true });
        }
        
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (!user) {
          const currentCount = Number(localStorage.getItem(GUEST_COUNT_KEY) || "0");
          const newCount = currentCount + 1;
          localStorage.setItem(GUEST_COUNT_KEY, String(newCount));
          localStorage.setItem(GUEST_LIMIT_KEY, new Date().toISOString());
          
          if (newCount >= FREE_PLAN_LIMIT) {
            setGuestCheckAvailable(false);
          }
        } else {
          const saveSearchHistory = async () => {
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
                  result_count: profiles.length
                });
              
              if (searchError) throw searchError;
              
              refreshProfile();
            } catch (error) {
              console.error("Error saving search:", error);
            }
          };
          
          saveSearchHistory();
        }
      }, 500);
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
    if (filteredResults.length === 0) {
      toast({
        title: "No results to download",
        description: "Please perform a search first.",
        variant: "destructive",
      });
      return;
    }
    
    downloadTextReport(name, filteredResults);
    
    toast({
      title: "Report downloaded",
      description: `${filteredResults.length} profiles saved to text report`,
    });
  };

  const handleEmailReport = () => {
    if (filteredResults.length === 0) {
      toast({
        title: "No results to email",
        description: "Please perform a search first.",
        variant: "destructive",
      });
      return;
    }
    
    setEmailModalOpen(true);
  };

  const sendEmailReport = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    try {
      const success = await emailTextReport(email, name, filteredResults);
      return success;
    } catch (error) {
      console.error("Error sending email report:", error);
      return false;
    }
  };

  const filteredResults = selectedCategory 
    ? results.filter(profile => profile.category === selectedCategory)
    : results;

  const filteredAdditionalResults = selectedCategory 
    ? additionalResults.filter(profile => profile.category === selectedCategory)
    : additionalResults;

  const searchLimitReached = hasReachedSearchLimit();

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="container mx-auto py-16 px-4 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight animate-fade-in">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Candidate Checker</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 md:mb-12 animate-fade-in" style={{animationDelay: "0.2s"}}>
                Find and verify social media profiles with a simple search
              </p>

              <Card className={`mb-8 shadow-md border-blue-100 overflow-hidden ${searchLimitReached ? 'opacity-75' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row relative">
                    {searchLimitReached && (
                      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center p-4">
                          <Lock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Search Limit Reached</h3>
                          <p className="text-gray-600 mb-4">
                            You've used all your {FREE_PLAN_LIMIT} daily searches.
                            {!user ? " Sign in for more searches." : ""}
                          </p>
                          {!user ? (
                            <Link to="/auth">
                              <Button className="mr-2">Sign In</Button>
                            </Link>
                          ) : (
                            <Button onClick={() => navigate("/profile?tab=plans")}>
                              Upgrade Plan
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    <Input
                      type="text"
                      placeholder="Enter first and last name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 border-0 rounded-none text-lg py-7 px-6 md:rounded-l-lg text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !searchLimitReached) handleSearch();
                      }}
                      disabled={searchLimitReached}
                    />
                    <Button 
                      onClick={() => handleSearch()}
                      disabled={isSearching || searchLimitReached}
                      className="md:w-auto w-full bg-blue-600 hover:bg-blue-700 rounded-none md:rounded-r-lg py-7 text-base"
                      size="lg"
                    >
                      {isSearching ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Search size={20} />
                          <span>Search Profiles</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isSearching && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm animate-fade-in">
                  <p className="text-blue-700 mb-2">Searching social networks for "{name}"</p>
                  <Progress value={searchProgress} className="h-2 bg-blue-100" />
                </div>
              )}

              {!user && !guestCheckAvailable && !isSearching && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                  <p className="text-blue-700">
                    You've used your {FREE_PLAN_LIMIT} daily searches. <Link to="/auth" className="font-bold underline hover:text-blue-800">Sign in</Link> to continue searching (3 searches per day with a free account).
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Search across multiple platforms</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Export reports easily</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>100% private searches</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 px-4" ref={resultsRef}>
          <div className="container mx-auto max-w-6xl">
            {name && (results.length > 0 || isSearching) && (
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-800">
                    Results for <span className="text-blue-600">{name}</span>
                    <span className="text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full border border-blue-200">
                      {filteredResults.length} found
                    </span>
                  </h2>
                  {searchTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      Results found in {searchTime}ms
                    </p>
                  )}
                </div>
                
                {filteredResults.length > 0 && (
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
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEmailReport}
                      className="border-gray-300 hover:bg-gray-100 text-gray-700"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Email
                    </Button>
                  </div>
                )}
              </div>
            )}

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-6">
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

            {filteredResults.length > 0 && <Separator className="bg-gray-200 my-4" />}

            {!selectedCategory && Object.keys(profilesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(profilesByCategory).map(([category, profiles]) => (
                  <div key={category}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                      {category}
                      <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full border border-blue-200">
                        {profiles.length}
                      </span>
                    </h3>
                    <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                      {profiles.map((profile, index) => (
                        <SocialResultCard key={`${category}-${index}`} profile={profile} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredResults.map((profile, index) => (
                  <SocialResultCard key={index} profile={profile} />
                ))}
              </div>
            )}

            {additionalResults.length > 0 && (
              <>
                <div className="mt-8 mb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Additional Web Results
                    <span className="text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full border border-blue-200">
                      {filteredAdditionalResults.length} found
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Additional profiles found from across the web
                  </p>
                </div>

                <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredAdditionalResults.map((profile, index) => (
                    <SocialResultCard key={`additional-${index}`} profile={profile} />
                  ))}
                </div>
              </>
            )}

            {availableDomains.length > 0 && availableDomains.some(d => d.available) && (
              <div className="mt-10 mb-6">
                <DomainSuggestions username={name.toLowerCase().replace(/\s+/g, '')} domains={availableDomains} />
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center gap-1">
                <ExternalLink size={14} />
                Links will open in a new tab
              </p>
            </div>
          </div>
        </section>

        {results.length === 0 && !isSearching && name && (
          <section className="py-8 px-4 text-center">
            <div className="container mx-auto max-w-3xl">
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Results Found</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any social media profiles matching "{name}". Try a different name or check your spelling.
                </p>
                <Button 
                  onClick={() => setName("")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Another Search
                </Button>
              </div>
            </div>
          </section>
        )}

        {!name && !isSearching && results.length === 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Candidate Research Tool</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Easily find and verify social media profiles for candidates across multiple platforms
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Search</h3>
                  <p className="text-gray-600">
                    Search across multiple platforms to find candidates' social media profiles in seconds.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Reports</h3>
                  <p className="text-gray-600">
                    Download reports or email them directly to your team for easy collaboration.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                  <p className="text-gray-600">
                    All searches are private and secure. We never store or share search data.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <EmailReportDialog 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={sendEmailReport}
        searchName={name}
      />
      
      <Footer />
    </div>
  );
};

export default Index;
