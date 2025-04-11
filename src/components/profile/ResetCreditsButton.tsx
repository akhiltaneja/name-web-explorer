
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ResetCreditsButtonProps {
  onReset: () => void;
  userId?: string; // Optional userId for admin reset functionality
}

const ResetCreditsButton = ({ onReset, userId }: ResetCreditsButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleResetCredits = async () => {
    // Determine which user ID to use (admin can reset for specific user)
    const targetUserId = userId || (user ? user.id : null);
    
    if (!targetUserId) return;

    try {
      // Get today's date in UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUTC = today.toISOString().split('T')[0];
      
      // Delete today's searches for this user
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('user_id', targetUserId)
        .gte('created_at', todayUTC);
      
      if (error) throw error;
      
      // Log this action
      if (user && user.id) {
        await supabase
          .from('admin_logs')
          .insert({
            action: userId ? 'admin_reset_user_credits' : 'user_reset_credits',
            user_id: user.id,
            target_user_id: targetUserId,
            details: `Reset daily searches for user ${targetUserId}`
          });
      }
      
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
      {userId ? "Reset Daily Credits" : "Reset My Daily Credits"}
    </Button>
  );
};

export default ResetCreditsButton;
