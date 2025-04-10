import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { SearchHistory, PlanOption, SocialMediaProfile } from "@/types/socialMedia";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import EmailReportDialog from "@/components/EmailReportDialog";
import { downloadTextReport, emailTextReport } from "@/utils/reportGenerator";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import SearchHistoryTable from "@/components/profile/SearchHistoryTable";
import PlansSection from "@/components/profile/PlansSection";

const plans: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for occasional use.',
    price: 0,
    limit: '3 daily searches',
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
  const { user, signOut, profile, loadingProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const plansRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'plans' ? 'plans' : 'account';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (activeTab === 'plans' && plansRef.current) {
      plansRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSearchHistory();
  }, [user]);

  useEffect(() => {
    if (!loadingProfile) {
      setLoading(false);
    }
  }, [loadingProfile]);

  const fetchSearchHistory = async () => {
    if (user) {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

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
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectPlan = async (planId: string) => {
    navigate(`/cart?plan=${planId}`);
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
    downloadTextReport(query, profiles);
    
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
    const success = await emailTextReport(email, selectedSearchQuery, profiles);
    
    return success;
  };

  const handleUpgradeClick = () => {
    setActiveTab('plans');
    setTimeout(() => {
      if (plansRef.current) {
        plansRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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

        <UserProfileHeader 
          user={user} 
          profile={profile} 
          onUpgradeClick={handleUpgradeClick}
          onLogout={handleSignOut}
        />

        <SearchHistoryTable 
          searchHistory={searchHistory}
          onClearHistory={handleClearHistory}
          onViewResults={handleViewResults}
          onDownloadReport={handleDownloadReport}
          onEmailReport={handleEmailReport}
        />

        {activeTab === 'plans' && (
          <PlansSection 
            ref={plansRef}
            plans={plans}
            currentPlan={profile?.plan}
            onSelectPlan={handleSelectPlan}
          />
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
