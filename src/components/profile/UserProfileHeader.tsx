import { User } from "@supabase/supabase-js";
import { Calendar, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import DefaultAvatar from "@/components/DefaultAvatar";
import { UserProfile } from "@/types/socialMedia";

interface UserProfileHeaderProps {
  user: User;
  profile: UserProfile | null;
  onUpgradeClick: () => void;
}

const UserProfileHeader = ({ user, profile, onUpgradeClick }: UserProfileHeaderProps) => {
  const usagePercentage = profile?.plan === 'free' 
    ? ((profile?.checks_used % 3) / 3) * 100 
    : profile?.plan === 'premium' 
      ? ((profile?.checks_used % 500) / 500) * 100 
      : 0;

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-lg p-8 mb-6 relative overflow-hidden shadow-sm border border-blue-100">
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
                    <span>{profile?.checks_used % 3} of 3 daily</span>
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
              onClick={onUpgradeClick}
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
              ? `${profile?.checks_used % 3}/3 daily searches` 
              : `${profile?.checks_used % 500}/500 monthly searches`}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2 bg-gray-200" />
        </div>
      )}
    </div>
  );
};

export default UserProfileHeader;
