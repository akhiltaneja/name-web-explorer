import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Edit, Trash, RefreshCcw, CheckCircle, Search, User, Users, Activity, Settings, BarChart, PieChart, CircleDollarSign, Download, ExternalLink, Home, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [anonUsers, setAnonUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSearches: 0,
    totalRevenue: 0,
  });
  const [affiliateLink, setAffiliateLink] = useState(() => {
    return localStorage.getItem('affiliateLink') || 'https://www.namecheap.com';
  });
  const { toast } = useToast();

  // Use an interval to keep refreshing data when tab is active
  useEffect(() => {
    fetchData();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000); // Refresh every 30 seconds when tab is visible
    
    // Event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Refresh data immediately when tab becomes visible
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchAnonUsers(),
        fetchSearches(),
        calculateStats()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Get total registered users count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total searches count
      const { count: searchCount, error: searchError } = await supabase
        .from('searches')
        .select('*', { count: 'exact', head: true });

      // Calculate revenue (placeholder - you would replace with actual revenue data)
      const { data: premiumUsers, error: premiumError } = await supabase
        .from('profiles')
        .select('*')
        .neq('plan', 'free');

      // Simple revenue calculation (placeholder)
      const revenue = premiumUsers ? premiumUsers.length * 29.99 : 0;

      setStats({
        totalUsers: userCount || 0,
        totalSearches: searchCount || 0,
        totalRevenue: revenue
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Exception fetching users:', err);
    }
  };

  const fetchAnonUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('anon_users')
        .select('*');

      if (error) {
        console.error('Error fetching unverified users:', error);
      } else {
        setAnonUsers(data || []);
      }
    } catch (err) {
      console.error('Exception fetching unverified users:', err);
    }
  };

  const fetchSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching searches:', error);
      } else {
        setSearches(data || []);
      }
    } catch (err) {
      console.error('Exception fetching searches:', err);
    }
  };

  const handleResetCredits = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ checks_used: 0 })
        .eq('id', userId);

      if (error) {
        console.error('Error resetting credits:', error);
        toast({
          title: "Error",
          description: "Failed to reset credits",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Credits reset successfully",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception resetting credits:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // First, delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to delete user profile",
          variant: "destructive",
        });
        return;
      }

      // Then try to delete the user auth entry (may require admin rights)
      toast({
        title: "Success",
        description: "User profile deleted. Note: The auth record may require manual deletion in Supabase.",
      });
      fetchUsers();
    } catch (err) {
      console.error('Exception deleting user:', err);
    }
  };

  const handleResetAllCredits = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ checks_used: 0 });

      if (error) {
        console.error('Error resetting all credits:', error);
        toast({
          title: "Error",
          description: "Failed to reset all credits",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "All users' credits reset successfully",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception resetting all credits:', err);
    }
  };

  const saveAffiliateLink = () => {
    localStorage.setItem('affiliateLink', affiliateLink);
    toast({
      title: "Success",
      description: "Affiliate link saved successfully",
    });
  };

  const getUserEmailById = (userId) => {
    if (!userId) return "N/A";
    
    // Check if userId starts with 'anon_' - it's an anonymous user
    if (String(userId).startsWith('anon_')) {
      return "Unverified User";
    }
    
    // Otherwise find the user in our profiles
    const user = users.find(u => u.id === userId);
    return user ? user.email : "Unknown User";
  };

  const handleViewSearchResults = (query) => {
    window.open(`/search/${encodeURIComponent(query)}`, '_blank');
  };

  const handleDownloadReport = (search) => {
    // This is a placeholder - you would implement actual report generation/download here
    toast({
      title: "Download Report",
      description: `Report download for "${search.query}" will be implemented.`,
    });
  };

  // User Row component
  const UserRow = ({ user }) => {
    return (
      <TableRow key={user.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar_url || ''} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {user.email}
                {user.role === 'admin' && (
                  <Badge className="bg-red-600">Admin</Badge>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.plan || 'free'}</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.checks_used || 0}</TableCell>
        <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleResetCredits(user.id)}
              className="h-8 w-8 p-0"
              title="Reset Credits"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                  handleDeleteUser(user.id);
                }
              }} 
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Delete User"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Unverified User Row component
  const UnverifiedUserRow = ({ user }) => {
    return (
      <TableRow key={user.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                Unverified User (ID: {user.identifier.substring(0, 8)}...)
                <Badge variant="outline" className="ml-2">Unverified</Badge>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.search_count || 0}</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(user.last_seen).toLocaleString()}
        </TableCell>
      </TableRow>
    );
  };

  // Search Row component
  const SearchRow = ({ search }) => {
    const isAnonSearch = search.user_id?.startsWith('anon_');
    const userEmail = getUserEmailById(search.user_id);
    
    return (
      <TableRow key={search.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            "{search.query}"
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {userEmail}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {search.result_count || 0} results
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(search.created_at).toLocaleString()}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewSearchResults(search.query)}
              className="h-8 w-8 p-0"
              title="View Results" 
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDownloadReport(search)}
              className="h-8 w-8 p-0"
              title="Download Report" 
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <Link to="/" className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50">
            <Home className="mr-3 h-5 w-5" />
            Back to Website
          </Link>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center w-full px-4 py-3 ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <BarChart className="mr-3 h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center w-full px-4 py-3 ${activeTab === "users" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Users className="mr-3 h-5 w-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center w-full px-4 py-3 ${activeTab === "activity" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Activity className="mr-3 h-5 w-5" />
            Activity Log
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center w-full px-4 py-3 ${activeTab === "settings" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSearches}</div>
                  <p className="text-xs text-muted-foreground">All time searches</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Estimated revenue</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searches.slice(0, 5).map(search => (
                      <TableRow key={search.id}>
                        <TableCell>"{search.query}"</TableCell>
                        <TableCell>{getUserEmailById(search.user_id)}</TableCell>
                        <TableCell>{new Date(search.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSearchResults(search.query)}
                            className="h-8 w-8 p-0"
                            title="View Results"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6 text-left">Email</TableHead>
                          <TableHead className="text-left">Plan</TableHead>
                          <TableHead className="text-left">Credits Used</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <UserRow key={user.id} user={user} />
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unverified Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6 text-left">Identifier</TableHead>
                          <TableHead className="text-left">Search Count</TableHead>
                          <TableHead className="text-left">Last Seen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {anonUsers.length > 0 ? (
                          anonUsers.map((user) => (
                            <UnverifiedUserRow key={user.id} user={user} />
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              No unverified users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Activity Log Tab */}
        {activeTab === "activity" && (
          <Card>
            <CardHeader>
              <CardTitle>Search Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6 text-left">Search Query</TableHead>
                        <TableHead className="text-left">User</TableHead>
                        <TableHead className="text-left">Results</TableHead>
                        <TableHead className="text-left">Date/Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searches.length > 0 ? (
                        searches.map((search) => (
                          <SearchRow key={search.id} search={search} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No search activity found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="affiliateLink">Domain Affiliate Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      id="affiliateLink"
                      value={affiliateLink}
                      onChange={(e) => setAffiliateLink(e.target.value)}
                      placeholder="https://www.namecheap.com/your-affiliate-id"
                      className="flex-1"
                    />
                    <Button onClick={saveAffiliateLink}>Save</Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    This link will be used when users click "See Domain Name Options" button
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
