
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const useAuthForms = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationError, setVerificationError] = useState<"sending_failed" | "rate_limit" | "user_exists" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleOAuthSignIn = async (provider: "google") => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    try {
      const siteUrl = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${siteUrl}/auth`,
        }
      });
      
      if (error) {
        if (error.message.includes("rate limit")) {
          setVerificationError("rate_limit");
          setVerificationEmail(values.email);
          setShowEmailVerification(true);
          return;
        } else if (error.message.includes("sending email") || error.message.includes("UNDEFINED_VALUE")) {
          setVerificationError("sending_failed");
          setVerificationEmail(values.email);
          setShowEmailVerification(true);
          return;
        } else if (error.message.includes("User already registered")) {
          setVerificationError("user_exists");
          setVerificationEmail(values.email);
          setShowEmailVerification(true);
          setIsSignUp(false);
          signInForm.setValue("email", values.email);
          return;
        } else {
          throw error;
        }
      }
      
      setVerificationError(null);
      setVerificationEmail(values.email);
      setShowEmailVerification(true);
      setShowConfetti(true);
      signUpForm.reset();
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("Email not confirmed") ||
            error.message.includes("user not found")) {
          setIsSignUp(true);
          signUpForm.setValue("email", values.email);
          signUpForm.setValue("password", values.password);
          
          toast({
            title: "Account not found",
            description: "We've switched to signup mode for you",
          });
        } else {
          throw error;
        }
      } else {
        signInForm.reset();
        navigate("/profile");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSignUp,
    setIsSignUp,
    isLoading,
    showEmailVerification,
    setShowEmailVerification,
    verificationEmail,
    verificationError,
    showConfetti,
    signUpForm,
    signInForm,
    handleOAuthSignIn,
    handleSignUp,
    handleSignIn,
  };
};
