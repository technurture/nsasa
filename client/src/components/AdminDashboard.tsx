import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  AlertCircle,
  User as UserIcon,
  Calendar,
  Briefcase,
  Home
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
  role: 'student' | 'admin' | 'super_admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  // Fetch current user to check if they're a super_admin
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
  });

  const isSuperAdmin = currentUser?.role === 'super_admin';

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

  // Mutation for updating user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'student' | 'admin' }) => {
      const response = await fetch(`/api/auth/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user role');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/admin/users'] });
      toast({
        title: 'Success',
        description: `User role updated to ${variables.role} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    },
  });

  const handleApproval = (userId: string, status: 'approved' | 'rejected') => {
    updateApprovalMutation.mutate({ userId, status });
  };

  const handleRoleToggle = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    updateRoleMutation.mutate({ userId, role: newRole });
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
              isSuperAdmin={isSuperAdmin}
            />
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <UsersListContent 
              users={users} 
              isLoading={isLoading} 
              status="approved"
              isSuperAdmin={isSuperAdmin}
              onRoleToggle={handleRoleToggle}
              isUpdatingRole={updateRoleMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <UsersListContent users={users} isLoading={isLoading} status="rejected" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// User Details Dialog Component
function UserDetailsDialog({ 
  user, 
  open, 
  onOpenChange,
  onApproval,
  isUpdating,
  showActions = false
}: { 
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproval?: (userId: string, status: 'approved' | 'rejected') => void;
  isUpdating?: boolean;
  showActions?: boolean;
}) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-user-details">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </DialogDescription>
            </div>
            <Badge variant="outline" 
              className={
                user.approvalStatus === 'pending' 
                  ? "text-yellow-600 border-yellow-600" 
                  : user.approvalStatus === 'approved'
                  ? "text-green-600 border-green-600"
                  : "text-red-600 border-red-600"
              }
            >
              {user.approvalStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {user.approvalStatus === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
              {user.approvalStatus === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
              {user.approvalStatus.charAt(0).toUpperCase() + user.approvalStatus.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{user.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.matricNumber && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Matric Number</p>
                  <p className="font-medium flex items-center gap-2">
                    {user.matricNumber}
                    {user.matricNumber.toLowerCase().includes('soc') && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        SOC ✓
                      </Badge>
                    )}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium">{user.level} Level</p>
              </div>
              {user.occupation && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Occupation
                  </p>
                  <p className="font-medium">{user.occupation}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location Type</p>
                <p className="font-medium capitalize">{user.location.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Address
                </p>
                <p className="font-medium">{user.address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Profile Completion</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${user.profileCompletion}%` }}
                    />
                  </div>
                  <span className="font-medium text-sm">{user.profileCompletion}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Registered On</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && onApproval && user.approvalStatus === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    onApproval(user._id, 'approved');
                    onOpenChange(false);
                  }}
                  disabled={isUpdating}
                  className="flex-1"
                  data-testid={`button-approve-dialog-${user._id}`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve User
                </Button>
                <Button
                  onClick={() => {
                    onApproval(user._id, 'rejected');
                    onOpenChange(false);
                  }}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                  data-testid={`button-reject-dialog-${user._id}`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject User
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component for pending users that need approval
function PendingUsersContent({ 
  users, 
  isLoading, 
  onApproval, 
  isUpdating,
  isSuperAdmin
}: { 
  users: User[]; 
  isLoading: boolean; 
  onApproval: (userId: string, status: 'approved' | 'rejected') => void;
  isUpdating: boolean;
  isSuperAdmin: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card 
            key={user._id} 
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => setSelectedUser(user)}
            data-testid={`card-user-${user._id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex-shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm">
                {user.matricNumber && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Matric:</span>
                    <span className="font-medium truncate">{user.matricNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{user.phoneNumber}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{user.level}</span>
                </div>

                <div className="text-xs text-muted-foreground pt-1 border-t">
                  Applied: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproval(user._id, 'approved');
                    }}
                    disabled={isUpdating}
                    className="flex-1"
                    size="sm"
                    data-testid={`button-approve-${user._id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproval(user._id, 'rejected');
                    }}
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <UserDetailsDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        onApproval={isSuperAdmin ? onApproval : undefined}
        isUpdating={isUpdating}
        showActions={isSuperAdmin}
      />
    </>
  );
}

// Component for approved/rejected users list
function UsersListContent({ 
  users, 
  isLoading, 
  status,
  isSuperAdmin,
  onRoleToggle,
  isUpdatingRole
}: { 
  users: User[]; 
  isLoading: boolean; 
  status: 'approved' | 'rejected';
  isSuperAdmin?: boolean;
  onRoleToggle?: (userId: string, currentRole: string) => void;
  isUpdatingRole?: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    <>
      <div className="space-y-4">
        {users.map((user) => (
          <Card 
            key={user._id}
            className="hover-elevate cursor-pointer transition-all"
            onClick={() => setSelectedUser(user)}
            data-testid={`card-user-${user._id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="flex-shrink-0">
                  <AvatarFallback>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="font-semibold">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    {user.matricNumber && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 flex-shrink-0" />
                        {user.matricNumber}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-2 flex-shrink-0">
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
                  
                  {/* Role Badge */}
                  <div className="flex justify-end">
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* Role Toggle Button - Only for approved users and super_admins */}
                  {status === 'approved' && isSuperAdmin && onRoleToggle && user.role !== 'super_admin' && (
                    <Button
                      size="sm"
                      variant={user.role === 'admin' ? 'destructive' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRoleToggle(user._id, user.role);
                      }}
                      disabled={isUpdatingRole}
                      data-testid={`button-toggle-role-${user._id}`}
                      className="w-full text-xs"
                    >
                      {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserDetailsDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        showActions={false}
      />
    </>
  );
}