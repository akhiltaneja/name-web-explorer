
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";

interface SignUpFormProps {
  form: UseFormReturn<{
    email: string;
    password: string;
  }>;
  onSubmit: (values: { email: string; password: string; }) => void;
  isLoading: boolean;
}

const SignUpForm = ({ form, onSubmit, isLoading }: SignUpFormProps) => {
  return (
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
      <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
        {isLoading ? 
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div> 
          : "Create Account"
        }
      </Button>
    </form>
  );
};

export default SignUpForm;
