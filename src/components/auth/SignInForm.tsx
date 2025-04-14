
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { SignInFormValues } from "@/hooks/useAuthForms";

interface SignInFormProps {
  form: UseFormReturn<SignInFormValues>;
  onSubmit: (values: SignInFormValues) => void;
  isLoading: boolean;
  onOAuthSignIn: (provider: "google") => void;
}

const SignInForm = ({ form, onSubmit, isLoading, onOAuthSignIn }: SignInFormProps) => {
  return (
    <div className="grid gap-4">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => onOAuthSignIn("google")} 
        disabled={isLoading}
      >
        {isLoading ? 
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> 
          : <span className="mr-2">G</span>
        }
        Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            {...form.register("email")} 
            disabled={isLoading} 
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...form.register("password")}
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> 
            : "Sign In"
          }
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
