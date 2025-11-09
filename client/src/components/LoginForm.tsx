import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LogIn, Eye, EyeOff, AlertCircle, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@/hooks/useAuth";

interface LoginFormProps {
  onLogin?: (credentials: { email: string; password: string; rememberMe: boolean }) => void;
  onForgotPassword?: (email: string) => void;
  onSignUpRedirect?: () => void;
}

export default function LoginForm({ onLogin, onForgotPassword, onSignUpRedirect }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    loginMutation.mutate(
      { email: formData.email, password: formData.password },
      {
        onSuccess: (data) => {
          // Redirect based on user role
          const userRole = data?.user?.role;
          if (userRole === 'admin' || userRole === 'super_admin') {
            setLocation('/dashboard');
          } else {
            // Students and other roles go to home page
            setLocation('/');
          }
          onLogin?.(formData);
        },
        onError: (error: any) => {
          setErrors({ form: error.message || "Login failed. Please try again." });
        }
      }
    );
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address first" });
      return;
    }
    onForgotPassword?.(formData.email);
    console.log("Forgot password for:", formData.email);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto p-3 bg-primary/10 rounded-full">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Nsasa account to continue your learning journey
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {errors.form && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.form}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              data-testid="input-email"
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pr-10"
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                data-testid="checkbox-remember-me"
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me
              </Label>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              className="p-0 h-auto text-sm underline"
              onClick={handleForgotPassword}
              data-testid="button-forgot-password"
            >
              Forgot password?
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        {/* Sign Up Link */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?
          </p>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full"
              onClick={onSignUpRedirect}
              data-testid="button-sign-up"
            >
              <Mail className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </Link>
        </div>

        {/* Student Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>New Students:</strong> After registering, please wait for admin approval 
            before you can access all platform features. This typically takes 1-2 business days.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}