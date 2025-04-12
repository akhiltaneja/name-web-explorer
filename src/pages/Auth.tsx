import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Github } from "lucide-react";
import EmailVerificationDialog from "@/components/auth/EmailVerificationDialog";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

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

  const handleOAuthSignIn = async (provider: "github" | "google") => {
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
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (error) throw error;
      
      // Update this section to show the dialog instead of just a toast
      setVerificationEmail(values.email);
      setShowEmailVerification(true);
      
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
      if (error) throw error;
      signInForm.reset();
      navigate("/profile");
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

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="w-full max-w-md p-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{isSignUp ? "Create an account" : "Sign in"}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Enter your email and password to create an account" : "Enter your email and password to sign in"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!isSignUp ? (
              <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("github")} disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> : <Github className="mr-2 h-4 w-4" />}
                Github
              </Button>
            ) : null}
            {!isSignUp ? (
              <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn("google")} disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> : <span className="mr-2">G</span>}
                Google
              </Button>
            ) : null}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" {...signUpForm.register("email")} disabled={isLoading} />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...signUpForm.register("password")}
                    disabled={isLoading}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> : "Create Account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" {...signInForm.register("email")} disabled={isLoading} />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...signInForm.register("password")}
                    disabled={isLoading}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> : "Sign In"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsSignUp(false)}>
                  Sign in
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Button variant="link" onClick={() => setIsSignUp(true)}>
                  Create one
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <EmailVerificationDialog 
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={verificationEmail}
      />
    </>
  );
};

export default Auth;
