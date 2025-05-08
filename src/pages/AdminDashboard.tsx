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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Edit, Trash, RefreshCcw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
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
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return {};
      }

      return data || {}; // Return empty object if data is null
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return {};
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
        fetchUsers(); // Refresh user list
      }
    } catch (err) {
      console.error('Exception resetting credits:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
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

      // If both deletions were successful, refresh the user list
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (err) {
      console.error('Exception deleting user:', err);
    }
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  // In the UserRow component:
  const UserRow = ({ user }: { user: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      const getProfile = async () => {
        setIsLoading(true);
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
        setIsLoading(false);
      };

      getProfile();
    }, [user.id]);

    return (
      <tr className="hover:bg-gray-50">
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {user.email}
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{profile?.plan || 'free'}</td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{profile?.checks_used || 0}</td>
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
              <DropdownMenuItem>
                <ResetCreditsButton
                  onReset={async () => {
                    await handleResetCredits(user.id);
                    refreshUsers();
                  }}
                  userId={user.id}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    );
  };

  const ResetCreditsButton = ({ onReset, userId }: { onReset: () => Promise<void>, userId: string }) => {
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
      setIsResetting(true);
      try {
        await onReset();
      } finally {
        setIsResetting(false);
      }
    };

    return (
      <DropdownMenuItem
        onClick={handleReset}
        disabled={isResetting}
        className="cursor-pointer"
      >
        {isResetting ? (
          <>
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Resetting...
          </>
        ) : (
          <>
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Credits
          </>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of all users in your account.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-left">Email</TableHead>
                <TableHead className="text-left">Plan</TableHead>
                <TableHead className="text-left">Credits Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
