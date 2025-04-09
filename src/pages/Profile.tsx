import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchHistory, PlanOption } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Clock, Search, LogOut, ArrowLeft, Trash } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

const plans: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for occasional use.',
    price: 0,
    limit: '5 daily searches',
    features: [
      'Basic social media search',
      'Limited profile information',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For regular users needing more searches.',
    price: 19,
    limit: '500 monthly searches',
    features: [
      'Unlimited social media search',
      'Enhanced profile details',
      'Priority support',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'For power users with high search needs.',
    price: 49,
    limit: 'Unlimited searches',
    features: [
      'Unlimited social media search',
      'Full profile information',
      '24/7 priority support',
      'Advanced analytics',
    ],
  },
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const { user, signOut, profile, loadingProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'plans' ? 'plans' : 'account';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('searches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (error) {
            console.error("Error fetching search history:", error);
            toast({
              title: "Error",
              description: "Failed to load search history",
              variant: "destructive",
            });
          } else {
            setSearchHistory(data || []);
          }
        } catch (error) {
          console.error("Error fetching search history:", error);
        }
      }
    };

    fetchSearchHistory();
  }, [user, toast]);

  useEffect(() => {
    if (!loadingProfile) {
      setLoading(false);
    }
  }, [loadingProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleClearHistory = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('searches')
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error clearing search history:", error);
          toast({
            title: "Error",
            description: "Failed to clear search history",
            variant: "destructive",
          });
        } else {
          setSearchHistory([]);
          toast({
            title: "Search history cleared",
            description: "Your search history has been successfully cleared.",
          });
        }
      } catch (error) {
        console.error("Error clearing search history:", error);
      }
    }
  };

  const handleSelectPlan = async (planId: string) => {
    toast({
      title: "Upgrade Coming Soon",
      description: `You selected the ${planId} plan. This feature is under development.`,
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6 pt-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Profile Information</CardTitle>
                <CardDescription>Manage your account details and usage limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold capitalize ${
                      profile?.plan === 'premium' ? 'text-blue-600' : 
                      profile?.plan === 'unlimited' ? 'text-purple-600' : 'text-gray-800'
                    }`}>
                      {profile?.plan || 'Free'}
                    </span>
                    {profile?.plan !== 'free' && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Usage</p>
                  <div className="text-gray-800">
                    {profile?.plan === 'free' && (
                      <span>{profile?.checks_used % 5} of 5 daily searches used</span>
                    )}
                    {profile?.plan === 'premium' && (
                      <span>{profile?.checks_used % 500} of 500 monthly searches used</span>
                    )}
                    {profile?.plan === 'unlimited' && (
                      <span>Unlimited searches</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                
                {profile?.plan === 'free' && (
                  <Button 
                    onClick={() => setActiveTab('plans')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </CardFooter>
            </Card>

            {searchHistory.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Recent Searches</CardTitle>
                    <CardDescription>Your search history</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearHistory}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Clear History
                  </Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mt-4">
                    {searchHistory.map((item) => (
                      <li key={item.id} className="flex gap-4 items-start p-3 rounded-lg border border-gray-200">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.query}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{format(new Date(item.created_at), 'MMM d, yyyy - h:mm a')}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {item.result_count} results
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="plans" className="space-y-6 pt-4">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-gray-600">
                Get more searches and unlock powerful features with our premium plans.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative border-gray-200 shadow-sm ${
                  plan.id === 'premium' 
                    ? 'border-blue-200 shadow-blue-100' 
                    : plan.id === 'unlimited' 
                      ? 'border-purple-200 shadow-purple-100'
                      : ''
                }`}>
                  {plan.id === 'premium' && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Popular Choice
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className={`text-xl ${
                      plan.id === 'premium' 
                        ? 'text-blue-600' 
                        : plan.id === 'unlimited' 
                          ? 'text-purple-600'
                          : 'text-gray-900'
                    }`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-gray-900">${plan.price}<span className="text-sm font-normal text-gray-500">{plan.id !== 'free' ? '/month' : ''}</span></p>
                      <p className="text-sm text-gray-500">{plan.limit}</p>
                    </div>
                    
                    <Separator className="bg-gray-200" />
                    
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-700">Features:</p>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <div className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5">✓</div>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {profile?.plan === plan.id ? (
                      <Button 
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-not-allowed" 
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Button 
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" 
                        disabled
                      >
                        Free Default
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${
                          plan.id === 'premium' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Upgrade
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>All plans include basic features. Premium and Unlimited plans offer advanced options.</p>
              <p className="mt-1">Questions? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a></p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
