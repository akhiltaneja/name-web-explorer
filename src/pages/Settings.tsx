
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailSettings from "@/components/settings/EmailSettings";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("email");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { returnTo: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  // Extract tab from URL query parameters if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['email', 'account', 'notifications', 'privacy'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <EmailSettings />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium">Account Settings</h3>
              <p className="text-gray-500 mt-2">Account settings will be available soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <p className="text-gray-500 mt-2">Notification settings will be available soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy">
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium">Privacy Settings</h3>
              <p className="text-gray-500 mt-2">Privacy settings will be available soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
