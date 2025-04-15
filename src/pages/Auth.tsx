
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { LucideGoogle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Confetti } from "@/components/auth/Confetti";

import { useAuthForms, SignUpFormValues, SignInFormValues } from "@/hooks/useAuthForms";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as any)?.returnTo || '/profile';

  const {
    isSignUp,
    setIsSignUp,
    isLoading,
    showEmailVerification,
    setShowEmailVerification,
    verificationEmail,
    verificationError,
    setVerificationError, // This is missing in the hooks response
    showConfetti,
    signUpForm,
    signInForm,
    handleOAuthSignIn,
    handleSignUp,
    handleSignIn,
  } = useAuthForms();

  const { user } = useAuth();

  // Redirect to the return path when authenticated
  useEffect(() => {
    if (user) {
      // Check if there's a return path to go back to (like the cart page)
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate, returnTo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <Confetti isVisible={showConfetti} />
      <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <Card className="bg-white shadow-xl rounded-2xl flex flex-col md:flex-row md:w-4/5 lg:w-3/5 overflow-hidden">
          <div className="w-full md:w-1/2 py-10 px-10">
            <div className="text-left font-bold text-blue-600">
              <Link to="/" className="hover:underline">
                PeoplePeeper
              </Link>
            </div>
            <div className="mt-5 text-3xl font-bold text-blue-600">
              {isSignUp ? "Create Account" : "Sign In"}
            </div>
            <div className="mt-2 text-gray-500">
              {isSignUp
                ? "Start exploring digital footprints today!"
                : "Sign in to access your dashboard."}
            </div>

            <form
              onSubmit={
                isSignUp
                  ? signUpForm.handleSubmit(handleSignUp)
                  : signInForm.handleSubmit(handleSignIn)
              }
              className="mt-8"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    {...(isSignUp ? signUpForm.register("email") : signInForm.register("email"))}
                    className="w-full mt-2"
                  />
                  {isSignUp && signUpForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                  {!isSignUp && signInForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    {...(isSignUp ? signUpForm.register("password") : signInForm.register("password"))}
                    className="w-full mt-2"
                  />
                  {isSignUp && signUpForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                  {!isSignUp && signInForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                {isSignUp ? null : (
                  <Link
                    to="/forgot-password"
                    className="text-sm hover:underline hover:text-blue-600"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  className="bg-blue-500 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : isSignUp ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <span className="border-b w-5/12 md:w-5/12"></span>
              <span className="font-bold text-gray-400">OR</span>
              <span className="border-b w-5/12 md:w-5/12"></span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                className="text-sm mt-2 py-3 w-full"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
              >
                <LucideGoogle className="w-5 h-5 mr-2" />
                Sign In with Google
              </Button>
            </div>

            <div className="mt-8 flex justify-center text-gray-500">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 font-bold ml-2 hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 font-bold ml-2 hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-blue-600 text-white py-10 px-10 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 opacity-70"></div>
            <div className="relative z-10">
              <div className="text-3xl font-bold mb-4">
                {isSignUp ? "Welcome to PeoplePeeper!" : "Welcome Back!"}
              </div>
              <div className="text-md mb-4">
                {isSignUp
                  ? "Join our community and start exploring the digital world."
                  : "Sign in to continue your search."}
              </div>
              <ul className="list-disc pl-5 text-sm">
                <li>Explore social media profiles</li>
                <li>Uncover hidden connections</li>
                <li>Verify online identities</li>
                <li>Access comprehensive data</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Verification Alert */}
      <AlertDialog open={showEmailVerification} onOpenChange={setShowEmailVerification}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email Verification Required</AlertDialogTitle>
            <AlertDialogDescription>
              {verificationError === "sending_failed" ? (
                <>
                  Failed to send verification email to <strong>{verificationEmail}</strong>.
                  Please ensure the email address is correct and try again.
                </>
              ) : verificationError === "rate_limit" ? (
                <>
                  Too many attempts. Please wait a few minutes before requesting another verification email for <strong>{verificationEmail}</strong>.
                </>
              ) : verificationError === "user_exists" ? (
                <>
                  An account with the email <strong>{verificationEmail}</strong> already exists. Please sign in instead or use a different email to sign up.
                </>
              ) : (
                <>
                  A verification email has been sent to <strong>{verificationEmail}</strong>. Please check your inbox and follow the instructions to verify your account.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowEmailVerification(false);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;
