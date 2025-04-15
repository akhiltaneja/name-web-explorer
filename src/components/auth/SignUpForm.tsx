
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerificationDialog from "./EmailVerificationDialog";

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSignupSuccess?: () => void;
}

export const SignUpForm = ({ onSignupSuccess }: SignUpFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationError, setVerificationError] = useState<"sending_failed" | "rate_limit" | "user_exists" | null>(null);
  
  const { supabase } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      // First check if the user already exists by trying to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      // If sign in is successful, the user exists and the password is correct
      if (signInData?.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in with your existing account.",
        });
        
        if (onSignupSuccess) {
          onSignupSuccess();
        }
        
        navigate("/profile");
        return;
      }
      
      // If the error is anything other than "Invalid login credentials", it's a different issue
      if (signInError && !signInError.message.includes("Invalid login credentials")) {
        throw signInError;
      }
      
      // At this point, either the user doesn't exist or the password was wrong
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes("User already registered")) {
          // User exists but the password was wrong
          setVerificationError("user_exists");
          setVerificationEmail(values.email);
          setShowVerificationDialog(true);
          return;
        } else if (error.message.includes("rate limit")) {
          setVerificationError("rate_limit");
          setVerificationEmail(values.email);
          setShowVerificationDialog(true);
          return;
        } else if (error.message.includes("sending email")) {
          setVerificationError("sending_failed");
          setVerificationEmail(values.email);
          setShowVerificationDialog(true);
          return;
        } else {
          throw error;
        }
      }
      
      // Successful signup
      setVerificationError(null);
      setVerificationEmail(values.email);
      setShowVerificationDialog(true);
      
      if (onSignupSuccess) {
        onSignupSuccess();
      }
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in slide-in-from-bottom-2">
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Enter your email"
              className="pl-9"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register("password")}
              type="password"
              placeholder="Choose a password"
              className="pl-9"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>
      
      <EmailVerificationDialog 
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        email={verificationEmail}
        errorType={verificationError}
      />
    </>
  );
};
