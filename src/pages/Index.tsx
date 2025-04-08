
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SocialResultCard from "@/components/SocialResultCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, ExternalLink, Filter, Grid, List } from "lucide-react";
import { getSocialMediaProfiles, getCategories } from "@/utils/socialMediaSearch";
import { SocialMediaProfile, SocialMediaCategory } from "@/types/socialMedia";

const Index = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SocialMediaProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<SocialMediaCategory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (results.length > 0) {
      setCategories(getCategories(results));
    }
  }, [results]);

  const handleSearch = () => {
    if (!name.trim()) {
      toast({
        title: "Please enter a name",
        description: "You need to provide at least a first name to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Create a username from the name
    const nameParts = name.trim().toLowerCase().split(" ");
    const username = nameParts.join("");
    
    // Get social media profiles
    const profiles = getSocialMediaProfiles(username, name);
    
    // Simulate async search with a timeout
    setTimeout(() => {
      setResults(profiles);
      setSelectedCategory(null);
      setIsSearching(false);
      
      toast({
        title: "Search complete",
        description: `Found ${profiles.length} potential profiles for ${name}`,
      });
    }, 1500);
  };

  const filteredResults = selectedCategory 
    ? results.filter(profile => profile.category === selectedCategory)
    : results;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Candidate Checker
            </h1>
            <p className="text-lg text-gray-600">
              Find social media profiles for candidates with a simple search
            </p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter first and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
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
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  Results for {name}
                  <span className="text-sm font-normal bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                    {filteredResults.length} found
                  </span>
                </h2>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="px-2"
                  >
                    {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
                  </Button>
                  
                  <Button 
                    variant={selectedCategory ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2 ${!selectedCategory && 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200'}`}
                  >
                    <Filter size={14} className="mr-1" />
                    All
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
                      className={selectedCategory === category.name ? "" : "bg-gray-50 hover:bg-gray-100"}
                    >
                      {category.name}
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white text-gray-800">
                        {category.count}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              <Separator />

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
