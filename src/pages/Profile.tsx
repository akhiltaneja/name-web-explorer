
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchHistory, PlanOption } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Clock, Search, LogOut, ArrowLeft, Trash } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchSearchHistory();
  }, [user, navigate]);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching search history:', error);
        toast({
          title: "Error",
          description: "Failed to load search history",
          variant: "destructive",
        });
      } else {
        setSearchHistory(data || []);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearchHistory = async () => {
    try {
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }
      
      setSearchHistory([]);
      toast({
        title: "Success",
        description: "Search history cleared",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async (plan: 'premium' | 'unlimited') => {
    // In a real app, this would redirect to a payment processor
    try {
      toast({
        title: "Upgrading Plan",
        description: "This would redirect to a payment page in a real application",
      });
      
      // Mock the upgrade process for demonstration
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan: plan,
          plan_start_date: new Date().toISOString(),
          plan_end_date: endDate.toISOString(),
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Plan Updated",
        description: `Your account has been upgraded to ${plan} plan`,
      });
      
      refreshProfile();
      
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade plan",
        variant: "destructive",
      });
    }
  };

  const planOptions: PlanOption[] = [
    {
      name: "Free",
      price: "$0/mo",
      features: ["5 candidate checks per day", "Basic search functionality"],
      checksAllowed: 5,
      current: profile?.plan === 'free',
      buttonText: "Current Plan",
    },
    {
      name: "Premium",
      price: "$5/mo",
      features: ["500 candidate checks per month", "Download reports", "Search history"],
      checksAllowed: 500,
      current: profile?.plan === 'premium',
      buttonText: profile?.plan === 'premium' ? "Current Plan" : "Upgrade",
    },
    {
      name: "Unlimited",
      price: "$20/mo",
      features: ["Unlimited candidate checks", "Priority support", "Advanced analytics"],
      checksAllowed: Infinity,
      current: profile?.plan === 'unlimited',
      buttonText: profile?.plan === 'unlimited' ? "Current Plan" : "Upgrade",
    },
  ];

  if (!user || !profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const checksRemaining = () => {
    if (profile.plan === 'unlimited') return 'Unlimited';
    if (profile.plan === 'premium') return 500 - (profile.checks_used % 500);
    return 5 - (profile.checks_used % 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="container mx-auto max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription className="text-gray-400">Your account information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(profile.email)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-medium">{profile.email}</h3>
                <div className="mt-2 flex items-center justify-center px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800">
                  <span className="capitalize">{profile.plan} Plan</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700 pt-4">
                <div>
                  <p className="text-gray-400 text-sm">Checks Remaining</p>
                  <p className="text-lg font-medium">{checksRemaining()}</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle>Search History</CardTitle>
                <CardDescription className="text-gray-400">Your recent searches</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : searchHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 text-gray-400">
                    <Search className="h-10 w-10 mb-2 opacity-50" />
                    <p>No search history yet</p>
                    <p className="text-sm">Your recent searches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchHistory.map((search) => (
                      <div key={search.id} className="flex items-start p-3 rounded-lg bg-gray-700/50">
                        <div className="mr-3 mt-0.5">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{search.query}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(search.created_at), 'MMM d, yyyy • h:mm a')}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{search.result_count} results</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600"
                  onClick={clearSearchHistory}
                  disabled={searchHistory.length === 0}
                >
                  <Trash className="mr-2 h-4 w-4" /> Clear History
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-gray-800 border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose the plan that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="free" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                    <TabsTrigger value="free">Free</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                    <TabsTrigger value="unlimited">Unlimited</TabsTrigger>
                  </TabsList>
                  {planOptions.map((plan) => (
                    <TabsContent key={plan.name.toLowerCase()} value={plan.name.toLowerCase()}>
                      <div className="rounded-lg border border-gray-700 p-6 bg-gray-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <p className="text-3xl font-bold mt-2">{plan.price}</p>
                          </div>
                          {plan.current && (
                            <div className="px-3 py-1 bg-green-900/30 text-green-300 border border-green-800 rounded-full text-sm">
                              Current Plan
                            </div>
                          )}
                        </div>
                        
                        <Separator className="my-6 bg-gray-700" />
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">What's included:</h4>
                          <ul className="space-y-3">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <div className="h-5 w-5 mr-2 text-green-400 shrink-0 mt-0.5">✓</div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          className={`w-full mt-6 ${plan.current ? 'bg-gray-600 cursor-default' : ''}`}
                          disabled={plan.current}
                          onClick={() => plan.name !== 'Free' && handleUpgrade(plan.name.toLowerCase() as 'premium' | 'unlimited')}
                        >
                          {plan.buttonText}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
