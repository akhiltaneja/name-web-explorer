import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Edit, Trash, RefreshCcw, CheckCircle, Search, User, Users, Activity, Settings, BarChart, PieChart, CircleDollarSign, Download, ExternalLink, Home, CheckCircle2, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile, AdminLog } from '@/types/socialMedia';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [anonUsers, setAnonUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
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
  const { user, profile, isAdmin, logAdminAction } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (profile && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [profile, isAdmin, navigate]);

  // Use an interval to keep refreshing data when tab is active
  useEffect(() => {
    if (isAdmin) {
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
    }
  }, [isAdmin]);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isAdmin) {
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
        fetchAdminLogs(),
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
      // Get total registered users from profiles table
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        console.error('Error counting users:', userError);
      }

      // Get total searches count
      const { count: searchCount, error: searchError } = await supabase
        .from('searches')
        .select('*', { count: 'exact', head: true });

      if (searchError) {
        console.error('Error counting searches:', searchError);
      }

      // Calculate revenue (from premium users)
      const { data: premiumUsers, error: premiumError } = await supabase
        .from('profiles')
        .select('*')
        .neq('plan', 'free');

      if (premiumError) {
        console.error('Error fetching premium users:', premiumError);
      }

      // Simple revenue calculation
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
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      // Map profiles to user format expected by the UI
      const mappedUsers = profiles?.map(profile => {
        return {
          id: profile.id,
          email: profile.email || '',
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          plan: profile.plan || 'free',
          checks_used: profile.checks_used || 0,
          plan_start_date: profile.plan_start_date,
          plan_end_date: profile.plan_end_date,
          role: profile.role || 'user'
        } as UserProfile;
      }) || [];
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Exception fetching users:', err);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
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
      // Get all searches, not just for the current user
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

  const fetchAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin logs:', error);
      } else {
        setAdminLogs(data as AdminLog[] || []);
      }
    } catch (err) {
      console.error('Exception fetching admin logs:', err);
    }
  };

  const handleResetCredits = async (userId: string) => {
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
        
        // Log the admin action
        await logAdminAction('reset_credits', 'Reset user credits', userId);
        
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception resetting credits:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the profile - this is safer than trying to delete from auth.users
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

      toast({
        title: "Success",
        description: "User profile deleted successfully",
      });
      
      // Log the admin action
      await logAdminAction('delete_user', 'Deleted user profile', userId);
      
      fetchUsers();
    } catch (err) {
      console.error('Exception deleting user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
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
        
        // Log the admin action
        await logAdminAction('reset_all_credits', 'Reset credits for all users');
        
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception resetting all credits:', err);
    }
  };

  const handleSetUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Error setting user role:', error);
        toast({
          title: "Error", 
          description: "Failed to update user role",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `User role updated to ${role}`,
        });
        
        // Log the admin action
        await logAdminAction('update_role', `Changed user role to ${role}`, userId);
        
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception setting user role:', err);
    }
  };

  const handleSetUserPlan = async (userId: string, plan: string) => {
    try {
      const now = new Date().toISOString();
      const endDate = plan === 'free' 
        ? null
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan,
          plan_start_date: plan === 'free' ? null : now,
          plan_end_date: endDate
        })
        .eq('id', userId);

      if (error) {
        console.error('Error setting user plan:', error);
        toast({
          title: "Error",
          description: "Failed to update user plan",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `User plan updated to ${plan}`,
        });
        
        // Log the admin action
        await logAdminAction('update_plan', `Changed user plan to ${plan}`, userId);
        
        fetchUsers();
      }
    } catch (err) {
      console.error('Exception setting user plan:', err);
    }
  };

  const saveAffiliateLink = () => {
    localStorage.setItem('affiliateLink', affiliateLink);
    toast({
      title: "Success",
      description: "Affiliate link saved successfully",
    });
    
    // Log the admin action
    logAdminAction('update_affiliate', `Updated affiliate link to ${affiliateLink}`);
  };

  const getUserEmailById = (userId: string) => {
    if (!userId) return "N/A";
    
    // Check if userId starts with 'anon_' - it's an unverified user
    if (String(userId).startsWith('anon_')) {
      return "Unverified User";
    }
    
    // Otherwise find the user in our profiles
    const user = users.find(u => u.id === userId);
    return user ? user.email : "Unknown User";
  };

  const handleViewSearchResults = (query: string) => {
    window.open(`/search/${encodeURIComponent(query)}`, '_blank');
  };

  const handleDownloadReport = (search: any) => {
    // This is a placeholder - you would implement actual report generation/download here
    toast({
      title: "Download Report",
      description: `Report download for "${search.query}" will be implemented.`,
    });
  };

  // User Row component
  const UserRow = ({ user }: { user: UserProfile }) => {
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleResetCredits(user.id)}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset Credits
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Set Role</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSetUserRole(user.id, 'user')}>
                  <User className="mr-2 h-4 w-4" />
                  User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetUserRole(user.id, 'admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Set Plan</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSetUserPlan(user.id, 'free')}>
                  Free Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetUserPlan(user.id, 'premium')}>
                  Premium Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetUserPlan(user.id, 'unlimited')}>
                  Unlimited Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                      handleDeleteUser(user.id);
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Unverified User Row component
  const UnverifiedUserRow = ({ user }: { user: any }) => {
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
  const SearchRow = ({ search }: { search: any }) => {
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
              className="h-8 p-2 flex items-center gap-1"
              title="View Results" 
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDownloadReport(search)}
              className="h-8 p-2 flex items-center gap-1"
              title="Download Report" 
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Admin Log Row component
  const LogRow = ({ log }: { log: AdminLog }) => {
    return (
      <TableRow key={log.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {log.action.replace(/_/g, ' ').toUpperCase()}
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {getUserEmailById(log.user_id)}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {log.target_user_id ? getUserEmailById(log.target_user_id) : "N/A"}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {log.details || "No details provided"}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(log.created_at).toLocaleString()}
        </TableCell>
      </TableRow>
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="mt-4 text-3xl font-bold">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
          <Button className="mt-6" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

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
            onClick={() => setActiveTab("admin-logs")}
            className={`flex items-center w-full px-4 py-3 ${activeTab === "admin-logs" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Shield className="mr-3 h-5 w-5" />
            Admin Logs
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
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
        
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
                            className="h-8 p-2 flex items-center gap-1"
                            title="View Results"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
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
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button variant="secondary" onClick={handleResetAllCredits}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset All Credits
              </Button>
            </div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
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
        
        {/* Admin Logs Tab */}
        {activeTab === "admin-logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Logs</CardTitle>
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
                        <TableHead className="pl-6 text-left">Action</TableHead>
                        <TableHead className="text-left">Admin</TableHead>
                        <TableHead className="text-left">Target User</TableHead>
                        <TableHead className="text-left">Details</TableHead>
                        <TableHead className="text-left">Date/Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminLogs.length > 0 ? (
                        adminLogs.map((log) => (
                          <LogRow key={log.id} log={log} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No admin logs found
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
