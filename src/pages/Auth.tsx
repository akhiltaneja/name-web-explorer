
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Confetti } from "@/components/auth/Confetti";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as any)?.returnTo || '/profile';
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-5xl">
        <Link to="/" className="mb-8 inline-block text-lg font-semibold text-blue-600 hover:text-blue-700">
          PeoplePeeper
        </Link>
        
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="grid md:grid-cols-2">
            {/* Left side - Form */}
            <div className="p-6 sm:p-8">
              <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0 space-y-4">
                  <div className="space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
                  </div>
                  <SignInForm />
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div className="space-y-2 text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">Enter your details to get started</p>
                  </div>
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right side - Decorative */}
            <div className="hidden md:block relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-2c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z\" fill=\"%23FFFFFF\" fill-opacity=\"0.05\"/%3E%3C/svg%3E')] opacity-10"></div>
                <div className="relative h-full p-6 sm:p-8 flex flex-col justify-center text-white space-y-6">
                  <h2 className="text-3xl font-bold">{activeTab === "signin" ? "Welcome Back!" : "Join Us Today!"}</h2>
                  <p className="text-lg opacity-90">
                    {activeTab === "signin" 
                      ? "Sign in to access your personalized dashboard and continue your journey with us."
                      : "Create an account to unlock all features and start exploring digital footprints today!"}
                  </p>
                  <ul className="space-y-4 text-sm opacity-75">
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Advanced search capabilities</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Real-time monitoring</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Detailed analytics & reports</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      {showConfetti && <Confetti isVisible={true} />}
    </div>
  );
};

export default Auth;
