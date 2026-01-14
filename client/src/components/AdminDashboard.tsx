import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Home,
  BarChart3,
  Search,
  Filter,
  X,
  Trophy,
  Medal,
  FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import PollManagement from './PollManagement';

interface FilterState {
  searchTerm: string;
  levelFilter: string;
  roleFilter: string;
  dateFilter: string;
}

const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' },
  { value: 'Graduated/Alumni', label: 'Graduated/Alumni' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
  { value: 'alumnus', label: 'Pass Out Student' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

function isWithinDateRange(dateString: string, filter: string): boolean {
  if (filter === 'all') return true;

  const date = new Date(dateString);
  const now = new Date();

  switch (filter) {
    case 'today': {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date >= startOfDay;
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    default:
      return true;
  }
}

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
  guardianPhoneNumber?: string;
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

  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    searchTerm: '',
    levelFilter: 'all',
    roleFilter: 'all',
    dateFilter: 'all',
  });

  const [approvedFilters, setApprovedFilters] = useState<FilterState>({
    searchTerm: '',
    levelFilter: 'all',
    roleFilter: 'all',
    dateFilter: 'all',
  });

  const [rejectedFilters, setRejectedFilters] = useState<FilterState>({
    searchTerm: '',
    levelFilter: 'all',
    roleFilter: 'all',
    dateFilter: 'all',
  });

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
    mutationFn: async ({ userId, role }: { userId: string; role: 'student' | 'admin' | 'alumnus' }) => {
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

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole as 'student' | 'admin' | 'alumnus' });
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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="polls" className="flex items-center gap-2" data-testid="tab-polls">
              <BarChart3 className="h-4 w-4" />
              Polls
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2" data-testid="tab-gamification">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2" data-testid="tab-content">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <PendingUsersContent
              users={users}
              isLoading={isLoading}
              onApproval={handleApproval}
              isUpdating={updateApprovalMutation.isPending}
              isSuperAdmin={isSuperAdmin}
              filters={pendingFilters}
              onFiltersChange={setPendingFilters}
            />
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <UsersListContent
              users={users}
              isLoading={isLoading}
              status="approved"
              isSuperAdmin={isSuperAdmin}
              onRoleChange={handleRoleChange}
              isUpdatingRole={updateRoleMutation.isPending}
              filters={approvedFilters}
              onFiltersChange={setApprovedFilters}
              showRoleFilter={true}
            />
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <UsersListContent
              users={users}
              isLoading={isLoading}
              status="rejected"
              filters={rejectedFilters}
              onFiltersChange={setRejectedFilters}
            />
          </TabsContent>

          <TabsContent value="polls" className="space-y-6">
            <PollManagement />
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <LeaderboardContent />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <BlogModerationContent />
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
            {user.approvalStatus && (
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
            )}
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
              {user.guardianPhoneNumber && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Guardian Phone Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.guardianPhoneNumber}
                  </p>
                </div>
              )}
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
                <p className="font-medium capitalize">{user.location ? user.location.replace(/([A-Z])/g, ' $1').trim() : 'Not Specified'}</p>
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

function UserFilterBar({
  filters,
  onFiltersChange,
  showRoleFilter = false,
  totalCount,
  filteredCount,
  isLoading
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showRoleFilter?: boolean;
  totalCount: number;
  filteredCount: number;
  isLoading: boolean;
}) {
  const hasActiveFilters = filters.searchTerm ||
    filters.levelFilter !== 'all' ||
    filters.roleFilter !== 'all' ||
    filters.dateFilter !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      levelFilter: 'all',
      roleFilter: 'all',
      dateFilter: 'all',
    });
  };

  return (
    <div className="space-y-4" data-testid="container-user-filters">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or matric number..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="pl-9"
            data-testid="input-user-search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.levelFilter}
            onValueChange={(value) => onFiltersChange({ ...filters, levelFilter: value })}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-level-filter">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent data-testid="select-level-content">
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  data-testid={`option-level-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showRoleFilter && (
            <Select
              value={filters.roleFilter}
              onValueChange={(value) => onFiltersChange({ ...filters, roleFilter: value })}
            >
              <SelectTrigger className="w-[120px]" data-testid="select-role-filter">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent data-testid="select-role-content">
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-testid={`option-role-${option.value}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filters.dateFilter}
            onValueChange={(value) => onFiltersChange({ ...filters, dateFilter: value })}
          >
            <SelectTrigger className="w-[130px]" data-testid="select-date-filter">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent data-testid="select-date-content">
              {DATE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  data-testid={`option-date-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isLoading && (
        <p className="text-sm text-muted-foreground" data-testid="text-filter-results">
          Showing {filteredCount} of {totalCount} users
          {hasActiveFilters && " (filtered)"}
        </p>
      )}
    </div>
  );
}

// Component for pending users that need approval
function PendingUsersContent({
  users,
  isLoading,
  onApproval,
  isUpdating,
  isSuperAdmin,
  filters,
  onFiltersChange
}: {
  users: User[];
  isLoading: boolean;
  onApproval: (userId: string, status: 'approved' | 'rejected') => void;
  isUpdating: boolean;
  isSuperAdmin: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = filters.searchTerm.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch = !filters.searchTerm ||
        fullName.includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.matricNumber?.toLowerCase().includes(searchLower) ?? false);

      const matchesLevel = filters.levelFilter === 'all' ||
        user.level === filters.levelFilter;

      const matchesDate = isWithinDateRange(user.createdAt, filters.dateFilter);

      return matchesSearch && matchesLevel && matchesDate;
    });
  }, [users, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <UserFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          totalCount={0}
          filteredCount={0}
          isLoading={true}
        />
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
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="text-center p-12" data-testid="empty-state-no-users">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Pending Registrations</h3>
        <p className="text-muted-foreground">
          All registrations have been reviewed.
        </p>
      </Card>
    );
  }

  const hasActiveFilters = filters.searchTerm ||
    filters.levelFilter !== 'all' ||
    filters.dateFilter !== 'all';

  return (
    <>
      <UserFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        totalCount={users.length}
        filteredCount={filteredUsers.length}
        isLoading={false}
      />

      {filteredUsers.length === 0 ? (
        <Card className="text-center p-12" data-testid="empty-state-no-results">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground mb-4">
            No users match your current search and filter criteria.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => onFiltersChange({
                searchTerm: '',
                levelFilter: 'all',
                roleFilter: 'all',
                dateFilter: 'all',
              })}
              data-testid="button-clear-filters-empty"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
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
      )}

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
  onRoleChange,
  isUpdatingRole,
  filters,
  onFiltersChange,
  showRoleFilter = false
}: {
  users: User[];
  isLoading: boolean;
  status: 'approved' | 'rejected';
  isSuperAdmin?: boolean;
  onRoleChange?: (userId: string, newRole: string) => void;
  isUpdatingRole?: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showRoleFilter?: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = filters.searchTerm.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch = !filters.searchTerm ||
        fullName.includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.matricNumber?.toLowerCase().includes(searchLower) ?? false);

      const matchesLevel = filters.levelFilter === 'all' ||
        user.level === filters.levelFilter;

      const matchesRole = filters.roleFilter === 'all' ||
        user.role === filters.roleFilter;

      const matchesDate = isWithinDateRange(user.createdAt, filters.dateFilter);

      return matchesSearch && matchesLevel && matchesRole && matchesDate;
    });
  }, [users, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <UserFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          showRoleFilter={showRoleFilter}
          totalCount={0}
          filteredCount={0}
          isLoading={true}
        />
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
      </div>
    );
  }

  if (users.length === 0) {
    const icon = status === 'approved' ? UserCheck : UserX;
    const IconComponent = icon;

    return (
      <Card className="text-center p-12" data-testid="empty-state-no-users">
        <IconComponent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''} Users
        </h3>
        <p className="text-muted-foreground">
          No users with {status} status found.
        </p>
      </Card>
    );
  }

  const hasActiveFilters = filters.searchTerm ||
    filters.levelFilter !== 'all' ||
    filters.roleFilter !== 'all' ||
    filters.dateFilter !== 'all';

  return (
    <>
      <UserFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        showRoleFilter={showRoleFilter}
        totalCount={users.length}
        filteredCount={filteredUsers.length}
        isLoading={false}
      />

      {filteredUsers.length === 0 ? (
        <Card className="text-center p-12" data-testid="empty-state-no-results">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground mb-4">
            No users match your current search and filter criteria.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => onFiltersChange({
                searchTerm: '',
                levelFilter: 'all',
                roleFilter: 'all',
                dateFilter: 'all',
              })}
              data-testid="button-clear-filters-empty"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
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
                      {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
                    </Badge>

                    {/* Role Badge */}
                    <div className="flex justify-end">
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.role === 'super_admin' ? 'Super Admin' : (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '')}
                      </Badge>
                    </div>

                    {/* Role Selection - Only for approved users and super_admins */}
                    {status === 'approved' && isSuperAdmin && onRoleChange && user.role !== 'super_admin' && (
                      <div className="w-full">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => {
                            onRoleChange(user._id, value);
                          }}
                          disabled={isUpdatingRole}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="alumnus">Pass Out Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
      )}

      <UserDetailsDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        showActions={false}
      />
    </>
  );
}

function LeaderboardContent() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/admin/gamification/leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/gamification/leaderboard', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gamification Leaderboard</CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-full animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Student Leaderboard
        </CardTitle>
        <CardDescription>
          Performance ranking based on level and profile completeness (Points System)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No active students to display.
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((student: any, index: number) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">
                    {index < 3 ? (
                      <div className="flex items-center gap-1">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                        <span className="ml-1">#{index + 1}</span>
                      </div>
                    ) : (
                      <span className="ml-5">#{index + 1}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                        <span className="text-xs text-muted-foreground">{student.matricNumber || 'No Matric'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.level || 'N/A'}</TableCell>
                  <TableCell className="text-right font-bold">
                    {/* Placeholder for points logic - using completion as proxy for now */}
                    {Math.floor((student.profileCompletion || 0) * 10) + (parseInt(student.level || '0') * 5)} pts
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BlogModerationContent() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch blogs
  const { data: blogs = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/blogs', filterStatus],
    queryFn: async () => {
      const response = await fetch(`/api/admin/blogs?status=${filterStatus}&limit=100`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    },
  });

  // Approval mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const response = await fetch(`/api/admin/blogs/${id}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update blog status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blogs'] });
      toast({
        title: "Success",
        description: "Blog status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Content Moderation</CardTitle>
          <CardDescription>Loading blog posts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-full animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Blog Content Moderation
            </CardTitle>
            <CardDescription>
              Review and manage student blog posts
            </CardDescription>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog: any) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="break-words line-clamp-2" title={blog.title}>
                      {blog.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {blog.author?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{blog.author?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {blog.approvalStatus === 'pending' && <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>}
                    {blog.approvalStatus === 'approved' && <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>}
                    {blog.approvalStatus === 'rejected' && <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {blog.approvalStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 px-2 bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ id: blog._id, status: 'approved' })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                            onClick={() => approveMutation.mutate({ id: blog._id, status: 'rejected' })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {(blog.approvalStatus === 'approved' || blog.approvalStatus === 'rejected') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => approveMutation.mutate({ id: blog._id, status: blog.approvalStatus === 'approved' ? 'rejected' : 'approved' })}
                        >
                          Change Status
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}