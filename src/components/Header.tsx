
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogIn, User, CreditCard, LayoutDashboard } from "lucide-react";
import DefaultAvatar from "./DefaultAvatar";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // For demo purposes, consider the admin email as admin@example.com
  const isAdmin = user?.email === "admin@example.com";

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">PP</span>
          </div>
          <span className="font-bold text-2xl text-purple-600">PeoplePeeper</span>
        </Link>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Button>
          )}
          
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <DefaultAvatar name={user.email || "User"} size="sm" className="mr-2" />
                My Account
              </Button>
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
