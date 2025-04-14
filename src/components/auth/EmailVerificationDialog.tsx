
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, RefreshCw, AlertTriangle, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  errorType?: "sending_failed" | "rate_limit" | "user_exists" | null;
}

const EmailVerificationDialog = ({ 
  isOpen, 
  onClose, 
  email, 
  errorType 
}: EmailVerificationDialogProps) => {
  const [isResending, setIsResending] = useState(false);
  const { supabase } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    if (isOpen && errorType) {
      setShowTroubleshooting(true);
    } else {
      setShowTroubleshooting(false);
    }
  }, [isOpen, errorType]);

  const handleOpenEmail = () => {
    // Common email providers - open in new tab
    if (email.includes('@gmail.com')) {
      window.open('https://gmail.com', '_blank');
    } else if (email.includes('@yahoo.com')) {
      window.open('https://mail.yahoo.com', '_blank');
    } else if (email.includes('@outlook.com') || email.includes('@hotmail.com')) {
      window.open('https://outlook.live.com', '_blank');
    } else if (email.includes('@aol.com')) {
      window.open('https://mail.aol.com', '_blank');
    } else {
      // Generic fallback
      window.open('https://mail.google.com', '_blank');
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Get the site URL to ensure proper redirection
      const siteUrl = window.location.origin;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          // Use site URL to ensure proper redirection after email confirmation
          emailRedirectTo: `${siteUrl}/auth`,
        }
      });
      
      if (error) {
        if (error.message.includes("rate limit")) {
          toast({
            title: "Too many attempts",
            description: "Please wait a few minutes before trying again",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error resending verification",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleRedirectToSignIn = () => {
    onClose();
    navigate("/auth");
  };

  const getDialogContent = () => {
    if (errorType === "user_exists") {
      return (
        <>
          <div className="mx-auto bg-amber-100 p-3 rounded-full mb-4">
            <LogIn className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Account Already Exists</DialogTitle>
          <DialogDescription className="text-center">
            An account with email address
            <br />
            <span className="font-medium text-black">{email}</span>
            <br />
            already exists
          </DialogDescription>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
            <p className="text-sm text-blue-800 font-medium mb-2">
              You already have an account with this email address.
            </p>
            <p className="text-sm text-blue-800">
              Please sign in with your existing credentials. If you forgot your password, you can use the password reset option.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 mt-5">
            <Button
              className="w-full" 
              onClick={handleRedirectToSignIn}
            >
              <LogIn className="mr-2 h-4 w-4" /> Go to Sign In
            </Button>
          </div>
        </>
      );
    } else if (errorType) {
      return (
        <>
          <div className="mx-auto bg-amber-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Verification Issue</DialogTitle>
          <DialogDescription className="text-center">
            We encountered a problem while trying to send a verification email to
            <br />
            <span className="font-medium text-black">{email}</span>
          </DialogDescription>
          
          <div className="bg-amber-50 p-4 rounded-lg mt-4 border border-amber-100">
            <p className="text-sm text-amber-800 font-medium mb-2">
              {errorType === "sending_failed" 
                ? "We're having trouble sending verification emails at the moment." 
                : "Too many verification attempts. Please try again later."}
            </p>
            <p className="text-sm text-amber-800">
              You can try the following:
            </p>
            <ul className="text-sm text-amber-800 list-disc pl-5 mt-2">
              <li>Try again in a few minutes</li>
              <li>Check that your email address is correct</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3 mt-5">
            <Button
              variant="outline"
              className="w-full" 
              onClick={() => onClose()}
            >
              Back to Sign In
            </Button>
          </div>
        </>
      );
    }
    
    return (
      <>
        <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <DialogTitle className="text-center text-2xl">Check your email</DialogTitle>
        <DialogDescription className="text-center">
          We sent a verification link to<br />
          <span className="font-medium text-black">{email}</span>
        </DialogDescription>

        <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-medium">🎉 You're almost there!</span> Click the verification link in your email to complete the sign-up process.
          </p>
          <p className="text-sm text-blue-800 mt-2">
            <span className="font-medium">Note:</span> The verification link will open in this window. Make sure to save any unsaved work before clicking it.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <Button 
            className="w-full" 
            onClick={handleOpenEmail}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Open Email App
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Resending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Resend Verification
              </>
            )}
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Did not receive an email? Check your spam folder or try another email address.</p>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {getDialogContent()}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;
