
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SocialResultCard from "@/components/SocialResultCard";
import { useToast } from "@/components/ui/use-toast";
import { Search, ExternalLink } from "lucide-react";
import { getSocialMediaProfiles } from "@/utils/socialMediaSearch";

const Index = () => {
  const [name, setName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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
      setIsSearching(false);
      
      toast({
        title: "Search complete",
        description: `Found ${profiles.length} potential profiles for ${name}`,
      });
    }, 1500);
  };

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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">
                  Search Results for {name}
                </h2>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((profile, index) => (
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
