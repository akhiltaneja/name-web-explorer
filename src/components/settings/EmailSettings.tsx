
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const EmailSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const resetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for a link to reset your password',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>
          Manage your email preferences and authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Email Address</h3>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Password</h3>
          <Button 
            variant="outline" 
            onClick={resetPassword}
          >
            Reset Password
          </Button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
          
          <div className="flex items-start space-x-2 mb-4">
            <input 
              type="checkbox" 
              id="marketing-emails" 
              className="mt-1"
              defaultChecked={true}
            />
            <div>
              <label htmlFor="marketing-emails" className="font-medium block">
                Marketing emails
              </label>
              <p className="text-sm text-gray-500">
                Receive emails about new features, tips, and special offers
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <input 
              type="checkbox" 
              id="account-emails" 
              className="mt-1"
              defaultChecked={true}
            />
            <div>
              <label htmlFor="account-emails" className="font-medium block">
                Account emails
              </label>
              <p className="text-sm text-gray-500">
                Receive important account notifications and security alerts
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
