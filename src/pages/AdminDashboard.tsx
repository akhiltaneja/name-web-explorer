import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  Users,
  Search,
  Link2,
  Activity,
  DollarSign,
  Filter,
  Download,
  Clock,
  UserPlus,
  FileText,
  ListFilter,
  PieChart,
  AreaChart,
  LayoutList,
  UserCheck,
  Trash
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DefaultAvatar from "@/components/DefaultAvatar";
import CountdownTimer from "@/components/search/CountdownTimer";
import ResetCreditsButton from "@/components/profile/ResetCreditsButton";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  plan: string;
  checks_used: number;
  daily_searches_used?: number;
}

interface AnonUserData {
  id: string;
  identifier: string;
  created_at: string;
  last_seen: string;
  search_count: number;
}

interface SearchData {
  id: string;
  query: string;
  created_at: string;
  result_count: number;
  user_email: string;
}

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string;
}

interface LogData {
  id: string;
  action: string;
  user_id: string;
  target_user_id?: string;
  details: string;
  created_at: string;
  user_email?: string;
}

const createAnonUsersTable = async () => {
  const { error } = await supabase.rpc('create_anon_users_table_if_not_exists');
  if (error) console.error("Error creating anon_users table:", error);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [anonUsers, setAnonUsers] = useState<AnonUserData[]>([]);
  const [searches, setSearches] = useState<SearchData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [filteredAnonUsers, setFilteredAnonUsers] = useState<AnonUserData[]>([]);
  const [filteredSearches, setFilteredSearches] = useState<SearchData[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogData[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [anonUserSearch, setAnonUserSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [totalSearches, setTotalSearches] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVerifiedUsers, setTotalVerifiedUsers] = useState(0);
  const [totalAnonUsers, setTotalAnonUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgResultsPerSearch, setAvgResultsPerSearch] = useState(0);
  const [activeTab, setActiveTab] = useState("stats");
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([
    { id: "1", name: "Namecheap", url: "https://www.namecheap.com/affiliates/?aff=YOUR_ID", description: "Domain registration" },
    { id: "2", name: "GoDaddy", url: "https://www.godaddy.com/affiliate-programs?isc=cjc999off&utm_source=affiliate&utm_medium=text&utm_campaign=2&utm_content=YOUR_ID", description: "Domain and hosting" },
    { id: "3", name: "Bluehost", url: "https://www.bluehost.com/affiliates/?id=YOUR_ID", description: "Web hosting" }
  ]);
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<{ name: string; searches: number }[]>([]);
  const [userStats, setUserStats] = useState<{ date: string; count: number; verified: number; anonymous: number }[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const checkAdmin = async () => {
      try {
        if (profile && profile.email === "akhiltaneja92@gmail.com") {
          setIsAdmin(true);
          await createAnonUsersTable();
          await fetchData();
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Could not access admin dashboard. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    checkAdmin();
  }, [navigate, user, profile, toast]);

  const trackAnonUser = async (identifier: string) => {
    try {
      const { data, error } = await supabase
        .from('anon_users')
        .select('*')
        .eq('identifier', identifier)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        await supabase.from('anon_users').insert({
          identifier: identifier,
          search_count: 1,
          last_seen: new Date().toISOString()
        });
      } else {
        await supabase
          .from('anon_users')
          .update({ 
            last_seen: new Date().toISOString(),
            search_count: data.search_count + 1
          })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error("Error tracking anonymous user:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      const { data: anonUsersData, error: anonUsersError } = await supabase
        .from('anon_users')
        .select('*')
        .order('last_seen', { ascending: false });
      
      if (anonUsersError) {
        console.error("Error fetching anonymous users:", anonUsersError);
        await createAnonUsersTable();
      }
      
      const { data: searchesData, error: searchesError } = await supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchesError) throw searchesError;
      
      const searchesWithEmails = await Promise.all(
        searchesData.map(async (search) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', search.user_id)
            .single();
          
          return {
            ...search,
            user_email: userError ? 'Anonymous' : userData.email
          };
        })
      );
      
      let { data: logsData, error: logsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (logsError) {
        console.error("Error fetching logs:", logsError);
        logsData = [];
      } else if (!logsData) {
        logsData = [];
      }
      
      const logsWithEmails = await Promise.all(
        (logsData || []).map(async (log) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', log.user_id)
            .single();
          
          return {
            ...log,
            user_email: userError ? 'Unknown' : userData.email
          };
        })
      );
      
      const formattedUsers = usersData as UserData[];
      const formattedAnonUsers = anonUsersData as AnonUserData[] || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUTC = today.toISOString().split('T')[0];
      
      const usersWithDailySearches = await Promise.all(
        formattedUsers.map(async (user) => {
          const { count, error } = await supabase
            .from('searches')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id)
            .gte('created_at', todayUTC);
          
          return {
            ...user,
            daily_searches_used: error ? 0 : (count || 0)
          };
        })
      );
      
      const formattedSearches = searchesWithEmails as SearchData[];
      
      const formattedLogs = logsWithEmails as LogData[];
      
      const premiumUsers = formattedUsers.filter(u => u.plan === 'premium').length;
      const unlimitedUsers = formattedUsers.filter(u => u.plan === 'unlimited').length;
      const revenue = (premiumUsers * 9.99) + (unlimitedUsers * 29.99);
      
      setUsers(usersWithDailySearches);
      setFilteredUsers(usersWithDailySearches);
      setAnonUsers(anonUsersData || []);
      setFilteredAnonUsers(anonUsersData || []);
      setSearches(formattedSearches);
      setFilteredSearches(formattedSearches);
      setLogs(formattedLogs);
      setFilteredLogs(formattedLogs);
      setTotalVerifiedUsers(formattedUsers.length);
      setTotalAnonUsers(anonUsersData?.length || 0);
      setTotalUsers(formattedUsers.length + (anonUsersData?.length || 0));
      setTotalSearches(formattedSearches.length);
      setTotalRevenue(revenue);
      
      const totalResults = formattedSearches.reduce((acc, search) => acc + search.result_count, 0);
      setAvgResultsPerSearch(formattedSearches.length ? totalResults / formattedSearches.length : 0);
      
      generateStatsData(formattedSearches, formattedUsers, anonUsersData || []);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStatsData = (searchesData: SearchData[], usersData: UserData[], anonUsersData: AnonUserData[]) => {
    const searchesByDay = searchesData.reduce((acc: Record<string, number>, search) => {
      const date = new Date(search.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const searchStatsData = Object.entries(searchesByDay)
      .map(([date, count]) => ({ name: date, searches: count }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-7);
    
    setSearchStats(searchStatsData);
    
    const usersByDay = usersData.reduce((acc: Record<string, { verified: number, anonymous: number }>, user) => {
      const date = new Date(user.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { verified: 0, anonymous: 0 };
      }
      acc[date].verified += 1;
      return acc;
    }, {});
    
    anonUsersData.forEach(anonUser => {
      const date = new Date(anonUser.created_at).toLocaleDateString();
      if (!usersByDay[date]) {
        usersByDay[date] = { verified: 0, anonymous: 0 };
      }
      usersByDay[date].anonymous += 1;
    });
    
    const dates = Object.keys(usersByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    let cumulativeVerified = 0;
    let cumulativeAnonymous = 0;
    const userGrowthData = dates.map(date => {
      cumulativeVerified += usersByDay[date].verified;
      cumulativeAnonymous += usersByDay[date].anonymous;
      return {
        date,
        count: cumulativeVerified + cumulativeAnonymous,
        verified: cumulativeVerified,
        anonymous: cumulativeAnonymous
      };
    });
    
    setUserStats(userGrowthData);
  };

  const handleUserSearch = () => {
    if (userSearch.trim() === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.email.toLowerCase().includes(userSearch.toLowerCase())
        )
      );
    }
  };

  const handleAnonUserSearch = () => {
    if (anonUserSearch.trim() === "") {
      setFilteredAnonUsers(anonUsers);
    } else {
      setFilteredAnonUsers(
        anonUsers.filter((user) =>
          user.identifier.toLowerCase().includes(anonUserSearch.toLowerCase())
        )
      );
    }
  };

  const handleQuerySearch = () => {
    if (querySearch.trim() === "") {
      setFilteredSearches(searches);
    } else {
      setFilteredSearches(
        searches.filter((search) =>
          search.query.toLowerCase().includes(querySearch.toLowerCase())
        )
      );
    }
  };

  const handleLogSearch = () => {
    if (logSearch.trim() === "") {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(
        logs.filter((log) =>
          log.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
          log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
          (log.user_email && log.user_email.toLowerCase().includes(logSearch.toLowerCase()))
        )
      );
    }
  };

  const handleAddAffiliateLink = () => {
    if (!newLink.name || !newLink.url) {
      toast({
        title: "Error",
        description: "Name and URL are required for affiliate links.",
        variant: "destructive",
      });
      return;
    }
    
    const id = Date.now().toString();
    setAffiliateLinks([...affiliateLinks, { ...newLink, id }]);
    setNewLink({ name: "", url: "", description: "" });
    
    toast({
      title: "Success",
      description: "Affiliate link added successfully.",
    });
  };

  const handleDeleteAffiliateLink = (id: string) => {
    setAffiliateLinks(affiliateLinks.filter(link => link.id !== id));
    
    toast({
      title: "Success",
      description: "Affiliate link deleted successfully.",
    });
  };
  
  const handleResetDailySearches = async (userId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUTC = today.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', userId)
        .gte('created_at', todayUTC);
      
      if (error) throw error;
      
      if (user && user.id) {
        try {
          await supabase
            .from('admin_logs')
            .insert({
              action: 'admin_reset_user_credits',
              user_id: user.id,
              target_user_id: userId,
              details: `Admin reset daily searches for user ${userId}`
            });
        } catch (logError) {
          console.error("Error logging action:", logError);
        }
      }
      
      await fetchData();
      
      toast({
        title: "Success",
        description: "Daily searches reset successfully for this user.",
      });
    } catch (error) {
      console.error("Error resetting daily searches:", error);
      toast({
        title: "Error",
        description: "Failed to reset daily searches.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, view statistics, and configure settings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <UserCheck className="h-3 w-3 mr-1" />
                      <span>{totalVerifiedUsers} verified</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Searches</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalSearches}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg Results/Search</p>
                    <h3 className="text-2xl font-bold text-gray-900">{avgResultsPerSearch.toFixed(1)}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Link2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
                    <p className="text-xs text-gray-500">from premium plans</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            <div className="w-full md:w-1/4 lg:w-1/5 space-y-2">
              <div className="bg-white border border-gray-200 p-1 rounded-md">
                <div className="flex flex-col space-y-1">
                  <button 
                    onClick={() => handleTabChange("stats")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "stats" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Statistics
                  </button>
                  
                  <button 
                    onClick={() => handleTabChange("users")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "users" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Verified Users
                  </button>
                  
                  <button 
                    onClick={() => handleTabChange("anon-users")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "anon-users" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Anonymous Users
                  </button>
                  
                  <button 
                    onClick={() => handleTabChange("searches")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "searches" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Searches
                  </button>
                  
                  <button 
                    onClick={() => handleTabChange("logs")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "logs" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <LayoutList className="h-4 w-4 mr-2" />
                    Activity Logs
                  </button>
                  
                  <button 
                    onClick={() => handleTabChange("affiliates")}
                    className={`flex items-center justify-start py-3 px-4 rounded-sm ${activeTab === "affiliates" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Affiliate Links
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-3/4 lg:w-4/5">
              {activeTab === "stats" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Search Activity</CardTitle>
                        <CardDescription>
                          Number of searches per day
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={searchStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="searches" fill="#4F46E5" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>
                          Cumulative user registrations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#4F46E5" 
                                activeDot={{ r: 8 }}
                                strokeWidth={2} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="verified" 
                                stroke="#10B981" 
                                activeDot={{ r: 6 }}
                                strokeWidth={2} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="anonymous" 
                                stroke="#F59E0B" 
                                activeDot={{ r: 6 }}
                                strokeWidth={2} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {activeTab === "users" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Verified Users</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search users by email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-64"
                        />
                        <Button onClick={handleUserSearch}>
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Total Searches</TableHead>
                          <TableHead>Daily Searches</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {user.avatar_url ? (
                                  <img 
                                    src={user.avatar_url} 
                                    alt="Avatar" 
                                    className="h-8 w-8 rounded-full"
                                  />
                                ) : (
                                  <DefaultAvatar name={user.email} size="sm" />
                                )}
                                <span>{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                user.plan === 'premium' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : user.plan === 'unlimited' 
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.plan || 'free'}
                              </span>
                            </TableCell>
                            <TableCell>{user.checks_used || 0}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-indigo-600">
                                  {user.plan === 'unlimited' 
                                    ? '∞' 
                                    : `${user.daily_searches_used || 0}/${user.plan === 'premium' ? '500' : '3'}`
                                  }
                                </span>
                                {user.plan === 'free' && user.daily_searches_used === 0 && (
                                  <div className="mt-1">
                                    <CountdownTimer />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <ResetCreditsButton 
                                onReset={() => handleResetDailySearches(user.id)} 
                                userId={user.id}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {filteredUsers.length} of {users.length} verified users
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "anon-users" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Anonymous Users</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search by identifier..."
                          value={anonUserSearch}
                          onChange={(e) => setAnonUserSearch(e.target.value)}
                          className="w-64"
                        />
                        <Button onClick={handleAnonUserSearch}>
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Identifier</TableHead>
                          <TableHead>Searches</TableHead>
                          <TableHead>First Seen</TableHead>
                          <TableHead>Last Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAnonUsers.length > 0 ? (
                          filteredAnonUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <DefaultAvatar name={user.identifier} size="sm" />
                                  <span className="font-mono text-sm">{user.identifier}</span>
                                </div>
                              </TableCell>
                              <TableCell>{user.search_count}</TableCell>
                              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(user.last_seen).toLocaleDateString()} {new Date(user.last_seen).toLocaleTimeString()}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                              No anonymous users found. They will appear here when non-logged in visitors search.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {filteredAnonUsers.length} of {anonUsers.length} anonymous users
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {activeTab === "searches" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Searches</CardTitle>
                    <CardDescription>
                      Search results and analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Query</TableHead>
                          <TableHead>Result Count</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSearches.map((search) => (
                          <TableRow key={search.id}>
                            <TableCell>{search.query}</TableCell>
                            <TableCell>{search.result_count}</TableCell>
                            <TableCell>
                              {search.user_email}
                            </TableCell>
                            <TableCell>{new Date(search.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "logs" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>
                      User actions and events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Target User</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>
                              {log.user_email}
                            </TableCell>
                            <TableCell>
                              {log.target_user_id && log.user_email !== log.target_user_id && (
                                <span>{log.target_user_id}</span>
                              )}
                            </TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>{new Date(log.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "affiliates" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Affiliate Links</CardTitle>
                    <CardDescription>
                      Manage affiliate programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Links</span>
                        <Button onClick={handleAddAffiliateLink}>
                          <Link2 className="h-4 w-4 mr-2" />
                          Add Link
                        </Button>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {affiliateLinks.map((link) => (
                          <div key={link.id} className="flex items-center justify-between">
                            <span>{link.name}</span>
                            <Button onClick={() => handleDeleteAffiliateLink(link.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
