
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DefaultAvatar from "@/components/DefaultAvatar";

// Types for admin dashboard
interface UserData {
  id: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  plan: string;
  checks_used: number;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searches, setSearches] = useState<SearchData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [filteredSearches, setFilteredSearches] = useState<SearchData[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [totalSearches, setTotalSearches] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgResultsPerSearch, setAvgResultsPerSearch] = useState(0);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([
    { id: "1", name: "Namecheap", url: "https://www.namecheap.com/affiliates/?aff=YOUR_ID", description: "Domain registration" },
    { id: "2", name: "GoDaddy", url: "https://www.godaddy.com/affiliate-programs?isc=cjc999off&utm_source=affiliate&utm_medium=text&utm_campaign=2&utm_content=YOUR_ID", description: "Domain and hosting" },
    { id: "3", name: "Bluehost", url: "https://www.bluehost.com/affiliates?id=YOUR_ID", description: "Web hosting" }
  ]);
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<{ name: string; searches: number }[]>([]);
  const [userStats, setUserStats] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // In a real app, you would check if the user is an admin
    // Here we're mocking it for demo purposes
    const checkAdmin = async () => {
      try {
        // In a real app, this would be a proper check against your database
        const isUserAdmin = user.email === "admin@example.com";
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        // Fetch data
        await fetchData();
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };
    
    checkAdmin();
  }, [navigate, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users (in a real app, this would be restricted by admin role)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Fetch searches data
      const { data: searchesData, error: searchesError } = await supabase
        .from('searches')
        .select('*, profiles!inner(email)');
      
      if (searchesError) throw searchesError;
      
      // Process the data
      const formattedUsers = usersData as UserData[];
      const formattedSearches = searchesData.map((search: any) => ({
        id: search.id,
        query: search.query,
        created_at: search.created_at,
        result_count: search.result_count,
        user_email: search.profiles.email
      })) as SearchData[];
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      setSearches(formattedSearches);
      setFilteredSearches(formattedSearches);
      setTotalUsers(formattedUsers.length);
      setTotalSearches(formattedSearches.length);
      
      // Calculate average results per search
      const totalResults = formattedSearches.reduce((acc, search) => acc + search.result_count, 0);
      setAvgResultsPerSearch(formattedSearches.length ? totalResults / formattedSearches.length : 0);
      
      // Generate stats data
      generateStatsData(formattedSearches, formattedUsers);
      
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

  const generateStatsData = (searchesData: SearchData[], usersData: UserData[]) => {
    // Group searches by day
    const searchesByDay = searchesData.reduce((acc: Record<string, number>, search) => {
      const date = new Date(search.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to chart format
    const searchStatsData = Object.entries(searchesByDay)
      .map(([date, count]) => ({ name: date, searches: count }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-7); // Last 7 days
    
    setSearchStats(searchStatsData);
    
    // Group users by sign-up day
    const usersByDay = usersData.reduce((acc: Record<string, number>, user) => {
      const date = new Date(user.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Compute cumulative user growth
    const dates = Object.keys(usersByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    let cumulativeCount = 0;
    const userGrowthData = dates.map(date => {
      cumulativeCount += usersByDay[date];
      return {
        date,
        count: cumulativeCount
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
                    <p className="text-sm font-medium text-gray-500">Platform Activity</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {searches.length > 0 
                        ? (searches.filter(s => new Date(s.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length)
                        : 0}
                    </h3>
                    <p className="text-xs text-gray-500">searches in last 24h</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="mb-8 bg-white border border-gray-200">
              <TabsTrigger value="stats" className="data-[state=active]:bg-blue-50">
                Statistics
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-50">
                Users
              </TabsTrigger>
              <TabsTrigger value="searches" className="data-[state=active]:bg-blue-50">
                Searches
              </TabsTrigger>
              <TabsTrigger value="affiliates" className="data-[state=active]:bg-blue-50">
                Affiliate Links
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="space-y-8">
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
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Users</span>
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
                        <TableHead>Searches Used</TableHead>
                        <TableHead>Joined</TableHead>
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
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="searches">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Search Queries</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search by query..."
                        value={querySearch}
                        onChange={(e) => setQuerySearch(e.target.value)}
                        className="w-64"
                      />
                      <Button onClick={handleQuerySearch}>
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
                        <TableHead>Query</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSearches.map((search) => (
                        <TableRow key={search.id}>
                          <TableCell>{search.query}</TableCell>
                          <TableCell>{search.user_email}</TableCell>
                          <TableCell>{search.result_count}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(search.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {filteredSearches.length} of {searches.length} searches
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Searches
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="affiliates">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Affiliate Links</CardTitle>
                      <CardDescription>
                        Manage affiliate links that appear across the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {affiliateLinks.map((link) => (
                            <TableRow key={link.id}>
                              <TableCell>{link.name}</TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate">
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {link.url}
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell>{link.description}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAffiliateLink(link.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Affiliate Link</CardTitle>
                    <CardDescription>
                      Create a new affiliate link to display on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Namecheap"
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="url">Affiliate URL</Label>
                        <Input
                          id="url"
                          placeholder="https://..."
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="e.g., Domain registration"
                          value={newLink.description}
                          onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAddAffiliateLink} className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Affiliate Link
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
