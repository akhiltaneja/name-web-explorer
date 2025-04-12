
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, RefreshCw } from "lucide-react";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationDialog = ({ isOpen, onClose, email }: EmailVerificationDialogProps) => {
  const [isResending, setIsResending] = useState(false);

  const handleOpenEmail = () => {
    // Common email providers
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

  const handleResendVerification = () => {
    setIsResending(true);
    // Simulate resending verification email
    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Check your email</DialogTitle>
          <DialogDescription className="text-center">
            We sent a verification link to<br />
            <span className="font-medium text-black">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-medium">🎉 You're almost there!</span> Click the verification link in your email to complete the sign-up process.
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
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;
