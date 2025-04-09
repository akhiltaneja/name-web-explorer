import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchHistory, PlanOption, SocialMediaProfile } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Search, 
  LogOut, 
  ArrowLeft, 
  Trash, 
  Download, 
  Mail, 
  FileText,
  Calendar,
  CheckCircle,
  User,
  ChevronRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DefaultAvatar from "@/components/DefaultAvatar";
import { Progress } from "@/components/ui/progress";
import EmailReportDialog from "@/components/EmailReportDialog";
import { downloadPdfReport, emailPdfReport } from "@/utils/reportGenerator";

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
  const [lastSearchResults, setLastSearchResults] = useState<SocialMediaProfile[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedSearchQuery, setSelectedSearchQuery] = useState<string>("");
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
            .order('created_at', { ascending: false });
          
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

  const generateDummyProfiles = (query: string): SocialMediaProfile[] => {
    const platforms = ["Twitter", "Facebook", "LinkedIn", "Instagram", "TikTok", "Reddit"];
    
    return platforms.map(platform => ({
      platform,
      url: `https://${platform.toLowerCase()}.com/${query}`,
      username: query,
      icon: platform.toLowerCase(),
      color: "#1DA1F2",
      category: ["Social", "Professional", "Video", "Photo"][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.2 ? "active" : "inactive"
    }));
  };

  const handleViewResults = (query: string) => {
    const profiles = generateDummyProfiles(query);
    setLastSearchResults(profiles);
    navigate(`/?query=${encodeURIComponent(query)}`);
  };

  const handleDownloadReport = (query: string) => {
    const profiles = generateDummyProfiles(query);
    downloadPdfReport(query, profiles);
    
    toast({
      title: "Report downloaded",
      description: `Report for "${query}" has been downloaded.`,
    });
  };

  const handleEmailReport = (query: string) => {
    setSelectedSearchQuery(query);
    setEmailModalOpen(true);
  };

  const sendEmailReport = async (email: string): Promise<boolean> => {
    const profiles = generateDummyProfiles(selectedSearchQuery);
    const success = await emailPdfReport(email, selectedSearchQuery, profiles);
    
    return success;
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

  const usagePercentage = profile?.plan === 'free' 
    ? ((profile?.checks_used % 5) / 5) * 100 
    : profile?.plan === 'premium' 
      ? ((profile?.checks_used % 500) / 500) * 100 
      : 0;
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
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
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 mb-6 relative overflow-hidden shadow-sm border border-blue-100">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="User Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                />
              ) : (
                <DefaultAvatar 
                  name={user.email || "User"} 
                  size="lg"
                  type="animal"
                  className="border-4 border-white shadow-md"
                />
              )}
            </div>
            
            <div className="flex-grow">
              <div className="text-4xl font-bold mb-1 text-gray-800">
                {user.user_metadata?.name || user.email?.split('@')[0] || "User"}
              </div>
              <div className="text-gray-600 mb-4">{user.email}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Registration date</div>
                    <div className="text-gray-700">{user.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Current plan</div>
                    <div className="flex items-center gap-2">
                      <span className={`capitalize font-medium ${
                        profile?.plan === 'premium' ? 'text-blue-600' : 
                        profile?.plan === 'unlimited' ? 'text-purple-600' : 'text-gray-700'
                      }`}>
                        {profile?.plan || 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Usage</div>
                    <div className="text-gray-700">
                      {profile?.plan === 'free' && (
                        <span>{profile?.checks_used % 5} of 5 daily</span>
                      )}
                      {profile?.plan === 'premium' && (
                        <span>{profile?.checks_used % 500} of 500 monthly</span>
                      )}
                      {profile?.plan === 'unlimited' && (
                        <span>Unlimited</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {profile?.plan !== 'unlimited' && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={() => setActiveTab('plans')}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
          </div>
          
          {profile?.plan !== 'unlimited' && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Usage</span>
                <span className="text-gray-600">{profile?.plan === 'free' 
                  ? `${profile?.checks_used % 5}/5 daily searches` 
                  : `${profile?.checks_used % 500}/500 monthly searches`}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2 bg-gray-200" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
          )}
        </div>

        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-800">Search History</h2>
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
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchHistory.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.query}</TableCell>
                      <TableCell>{format(parseISO(item.created_at), 'MMM d, yyyy - h:mm a')}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {item.result_count} results
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(item.query)}
                            className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(item.query)}
                            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmailReport(item.query)}
                            className="h-8 px-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                    <p className="text-sm text-gray-500">{plan.description}</p>
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
          </div>
        )}
      </div>

      <EmailReportDialog 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSend={sendEmailReport}
        searchName={selectedSearchQuery}
      />
    </div>
  );
};

export default Profile;
