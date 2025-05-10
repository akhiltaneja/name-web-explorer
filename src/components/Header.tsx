
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { LogIn, User, CreditCard, LayoutDashboard, Home, Settings, LogOut } from "lucide-react";
import DefaultAvatar from "./DefaultAvatar";

const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/'; // This will cause a full page refresh
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">PP</span>
          </div>
          <span className="font-bold text-2xl text-blue-600">PeoplePeeper</span>
        </a>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <DefaultAvatar name={user.email || "User"} size="sm" className="mr-2" />
                    My Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=plans')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
