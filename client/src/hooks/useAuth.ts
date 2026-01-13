import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/mongoSchema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check for fresh data on navigation
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 4000, // Poll every 4 seconds for "instant" role updates
  });

  // Only consider user authenticated if we have user data
  // Don't let temporary errors affect authentication state
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error
  };
}

// Hook for login functionality
export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: include cookies
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Update the user data in cache
      queryClient.setQueryData(["/api/auth/user"], data.user);

      // Verify the cookie is set by refetching
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  });
}

// Hook for registration functionality
export function useRegister() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include', // Important: include cookies
      });
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created and is pending approval",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    }
  });
}

// Hook for logout functionality
export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });

      queryClient.clear();
      queryClient.removeQueries();

      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    },
    onError: () => {
      queryClient.clear();
      queryClient.removeQueries();

      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  });
}