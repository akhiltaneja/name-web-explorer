
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogIn, User, CreditCard } from "lucide-react";
import DefaultAvatar from "./DefaultAvatar";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <span className="font-bold text-2xl text-blue-600">CandidateChecker</span>
        </Link>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <DefaultAvatar name={user.email || "User"} size="sm" className="mr-2" />
                )}
                My Account
              </Button>
              <Button 
                onClick={() => navigate('/profile?tab=plans')}
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
