import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricNumber?: string;
  gender: string;
  location: string;
  address: string;
  phoneNumber: string;
  level: string;
  occupation?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  // Fetch users by approval status
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/auth/admin/users', activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/auth/admin/users?status=${activeTab}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Mutation for updating user approval status
  const updateApprovalMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'approved' | 'rejected' }) => {
      const response = await fetch(`/api/auth/admin/users/${userId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/users'] });
      toast({
        title: 'Success',
        description: `User ${variables.status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      });
    },
  });

  const handleApproval = (userId: string, status: 'approved' | 'rejected') => {
    updateApprovalMutation.mutate({ userId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load admin dashboard. You may not have admin privileges.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage student registrations and user approvals
          </p>
        </div>

        {/* Tabs for different user statuses */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Approved Users
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Rejected Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <PendingUsersContent 
              users={users} 
              isLoading={isLoading} 
              onApproval={handleApproval}
              isUpdating={updateApprovalMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <UsersListContent users={users} isLoading={isLoading} status="approved" />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <UsersListContent users={users} isLoading={isLoading} status="rejected" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component for pending users that need approval
function PendingUsersContent({ 
  users, 
  isLoading, 
  onApproval, 
  isUpdating 
}: { 
  users: User[]; 
  isLoading: boolean; 
  onApproval: (userId: string, status: 'approved' | 'rejected') => void;
  isUpdating: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="text-center p-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Pending Registrations</h3>
        <p className="text-muted-foreground">
          All registrations have been reviewed.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card key={user._id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              {user.matricNumber && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Matric:</span>
                  <span>{user.matricNumber}</span>
                  {user.matricNumber.toLowerCase().includes('soc') && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      SOC ✓
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <span>{user.phoneNumber}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span className="capitalize">{user.location.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Level:</span>
                <span>{user.level} Level</span>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Applied: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onApproval(user._id, 'approved')}
                disabled={isUpdating}
                className="flex-1"
                size="sm"
                data-testid={`button-approve-${user._id}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => onApproval(user._id, 'rejected')}
                disabled={isUpdating}
                variant="destructive"
                className="flex-1"
                size="sm"
                data-testid={`button-reject-${user._id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component for approved/rejected users list
function UsersListContent({ 
  users, 
  isLoading, 
  status 
}: { 
  users: User[]; 
  isLoading: boolean; 
  status: 'approved' | 'rejected';
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    const icon = status === 'approved' ? UserCheck : UserX;
    const IconComponent = icon;
    
    return (
      <Card className="text-center p-12">
        <IconComponent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No {status.charAt(0).toUpperCase() + status.slice(1)} Users
        </h3>
        <p className="text-muted-foreground">
          No users with {status} status found.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user._id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="font-semibold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                  {user.matricNumber && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {user.matricNumber}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <Badge variant="outline" 
                  className={status === 'approved' 
                    ? "text-green-600 border-green-600" 
                    : "text-red-600 border-red-600"
                  }
                >
                  {status === 'approved' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}