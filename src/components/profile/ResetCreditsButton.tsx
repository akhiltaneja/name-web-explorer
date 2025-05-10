
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ResetCreditsButtonProps {
  onReset: () => void;
}

const ResetCreditsButton = ({ onReset }: ResetCreditsButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleResetCredits = async () => {
    if (!user) return;

    try {
      // Get today's date in UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUTC = today.toISOString().split('T')[0];
      
      // Delete today's searches for this user
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', todayUTC);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Daily searches have been reset successfully.",
      });
      
      // Call the callback to refresh data
      onReset();
    } catch (error) {
      console.error("Error resetting daily searches:", error);
      toast({
        title: "Error",
        description: "Failed to reset daily searches. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleResetCredits} 
      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Reset My Daily Credits
    </Button>
  );
};

export default ResetCreditsButton;
