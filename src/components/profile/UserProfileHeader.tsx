
import { User } from "@supabase/supabase-js";
import { Calendar, CheckCircle, LogOut, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import DefaultAvatar from "@/components/DefaultAvatar";
import { UserProfile } from "@/types/socialMedia";

interface UserProfileHeaderProps {
  user: User;
  profile: UserProfile | null;
  onUpgradeClick: () => void;
  onLogout: () => void;
}

const UserProfileHeader = ({ user, profile, onUpgradeClick, onLogout }: UserProfileHeaderProps) => {
  // Calculate usage and remaining searches
  const usagePercentage = profile?.plan === 'free' 
    ? Math.min(((profile?.checks_used % 3) / 3) * 100, 100)
    : profile?.plan === 'premium' 
      ? Math.min(((profile?.checks_used % 500) / 500) * 100, 100)
      : 0;
  
  const remainingSearches = profile?.plan === 'free'
    ? Math.max(0, 3 - (profile?.checks_used % 3))
    : profile?.plan === 'premium'
      ? Math.max(0, 500 - (profile?.checks_used % 500))
      : Infinity;

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
                <div className="text-sm text-gray-500">Searches Remaining</div>
                <div className="text-gray-700">
                  {profile?.plan === 'free' && (
                    <span className={remainingSearches === 0 ? "text-red-600 font-semibold" : ""}>
                      {remainingSearches} of 3 daily
                    </span>
                  )}
                  {profile?.plan === 'premium' && (
                    <span className={remainingSearches === 0 ? "text-red-600 font-semibold" : ""}>
                      {remainingSearches} of 500 monthly
                    </span>
                  )}
                  {profile?.plan === 'unlimited' && (
                    <span>Unlimited</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto">
          {profile?.plan !== 'unlimited' && (
            <Button 
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 w-full md:w-auto relative overflow-hidden group shadow-lg"
              size="lg"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -translate-x-full animate-shimmer"></span>
              <Sparkles className="h-4 w-4 mr-2 animate-pulse text-yellow-200" />
              <span className="relative z-10">Upgrade Plan</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onLogout}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2 w-full md:w-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
      
      {profile?.plan !== 'unlimited' && (
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 font-medium">Usage</span>
            <span className={`font-semibold ${remainingSearches === 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {profile?.plan === 'free' 
                ? `${3 - remainingSearches}/3 daily searches` 
                : `${500 - remainingSearches}/500 monthly searches`
              }
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-3 bg-gray-200" 
            indicatorClassName={remainingSearches === 0 
              ? "bg-gradient-to-r from-red-500 to-red-600" 
              : "bg-gradient-to-r from-blue-500 to-purple-600"
            } 
          />
        </div>
      )}
    </div>
  );
};

export default UserProfileHeader;
