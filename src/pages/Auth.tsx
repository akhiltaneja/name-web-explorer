
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailVerificationDialog from "@/components/auth/EmailVerificationDialog";
import Confetti from '@/components/auth/Confetti';
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuthForms } from "@/hooks/useAuthForms";

const Auth = () => {
  const {
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
  } = useAuthForms();

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        {showConfetti && <Confetti />}
        
        <Card className="w-full max-w-md p-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isSignUp ? "Create an account" : "Sign in"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? "Enter your email and password to create an account" 
                : "Enter your email and password to sign in"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isSignUp ? (
              <SignUpForm 
                form={signUpForm}
                onSubmit={handleSignUp}
                isLoading={isLoading}
              />
            ) : (
              <SignInForm
                form={signInForm}
                onSubmit={handleSignIn}
                isLoading={isLoading}
                onOAuthSignIn={handleOAuthSignIn}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-center text-sm text-muted-foreground">
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
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-blue-600 hover:text-blue-800"
                >
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
        errorType={verificationError}
      />
    </>
  );
};

export default Auth;
