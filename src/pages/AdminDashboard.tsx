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
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Edit, Trash, RefreshCcw, CheckCircle, Search, User, Users, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [anonUsers, setAnonUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
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
        fetchSearches()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
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
        console.error('Error fetching anonymous users:', error);
      } else {
        setAnonUsers(data || []);
      }
    } catch (err) {
      console.error('Exception fetching anonymous users:', err);
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

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return {};
      }

      return data || {};
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return {};
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

      // Then, delete the user from auth.users
      const { error: userError } = await supabase.auth.admin.deleteUser(userId);

      if (userError) {
        console.error('Error deleting user:', userError);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (err) {
      console.error('Exception deleting user:', err);
    }
  };

  // User Row component
  const UserRow = ({ user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return (
      <TableRow key={user.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar_url || ''} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                {user.email}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.plan || 'free'}</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.checks_used || 0}</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role === 'admin' ? 'Admin' : 'User'}</TableCell>
        <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                    handleDeleteUser(user.id);
                  }
                }}
                className="focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              >
                Delete <Trash className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleResetCredits(user.id)} className="cursor-pointer">
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset Credits
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  // Anonymous User Row component
  const AnonUserRow = ({ user }) => {
    return (
      <TableRow key={user.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                Anonymous (ID: {user.identifier.substring(0, 8)}...)
                <Badge variant="outline" className="ml-2">Guest</Badge>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Guest</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.search_count || 0}</TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(user.last_seen).toLocaleString()}
        </TableCell>
        <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
          {/* No actions for anonymous users */}
        </TableCell>
      </TableRow>
    );
  };

  // Search Row component
  const SearchRow = ({ search }) => {
    const isAnonSearch = search.user_id?.startsWith('anon_');
    const displayUserId = isAnonSearch 
      ? `Anonymous (${search.user_id.substring(5, 13)}...)` 
      : search.user_id;
      
    return (
      <TableRow key={search.id} className="hover:bg-gray-50">
        <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            "{search.query}"
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {displayUserId}
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {search.result_count || 0} results
        </TableCell>
        <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(search.created_at).toLocaleString()}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="anon" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Anonymous Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Activity Log
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="border rounded-md p-4">
          <h2 className="text-xl font-bold mb-4">Registered Users</h2>
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
                    <TableHead className="text-left">Role</TableHead>
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
                      <TableCell colSpan={5} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="anon" className="border rounded-md p-4">
          <h2 className="text-xl font-bold mb-4">Anonymous Users</h2>
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
                    <TableHead className="text-left">Type</TableHead>
                    <TableHead className="text-left">Search Count</TableHead>
                    <TableHead className="text-left">Last Seen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anonUsers.length > 0 ? (
                    anonUsers.map((user) => (
                      <AnonUserRow key={user.id} user={user} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No anonymous users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="border rounded-md p-4">
          <h2 className="text-xl font-bold mb-4">Search Activity</h2>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searches.length > 0 ? (
                    searches.map((search) => (
                      <SearchRow key={search.id} search={search} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No search activity found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
