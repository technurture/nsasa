import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@shared/mongoSchema";

const staffFormSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  office: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  publications: z.coerce.number().default(0),
  specializations: z.string().optional(),
  courses: z.string().optional(),
  education: z.string().optional(),
  showOnLanding: z.boolean().default(false),
  position: z.string().optional(),
  displayOrder: z.coerce.number().default(999),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface StaffWithUser {
  _id: string;
  userId: string;
  title: string;
  department: string;
  specializations: string[];
  office?: string;
  bio?: string;
  courses: string[];
  publications: number;
  experience?: string;
  education: string[];
  showOnLanding: boolean;
  position?: string;
  displayOrder: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export function StaffManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffWithUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Fetch all staff
  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery<StaffWithUser[]>({
    queryKey: ['/api/staff'],
  });

  // Fetch all approved users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/auth/admin/users', { status: 'approved' }],
    enabled: user?.role === 'super_admin' || user?.role === 'admin',
  });

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      userId: "",
      title: "",
      department: "",
      office: "",
      bio: "",
      experience: "",
      publications: 0,
      specializations: "",
      courses: "",
      education: "",
      showOnLanding: false,
      position: "",
      displayOrder: 999,
    },
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const { specializations, courses, education, ...rest } = data;
      
      const staffData = {
        ...rest,
        specializations: specializations ? specializations.split(',').map(s => s.trim()) : [],
        courses: courses ? courses.split(',').map(c => c.trim()) : [],
        education: education ? education.split(',').map(e => e.trim()) : [],
      };
      
      return apiRequest('POST', '/api/staff', staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaffFormData> }) => {
      const { specializations, courses, education, userId, ...rest } = data;
      
      const staffData = {
        ...rest,
        specializations: specializations ? (typeof specializations === 'string' ? specializations.split(',').map(s => s.trim()) : specializations) : undefined,
        courses: courses ? (typeof courses === 'string' ? courses.split(',').map(c => c.trim()) : courses) : undefined,
        education: education ? (typeof education === 'string' ? education.split(',').map(e => e.trim()) : education) : undefined,
      };
      
      return apiRequest('PUT', `/api/staff/${id}`, staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      setEditingStaff(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (staff: StaffWithUser) => {
    setEditingStaff(staff);
    form.reset({
      userId: staff.userId,
      title: staff.title,
      department: staff.department,
      office: staff.office || "",
      bio: staff.bio || "",
      experience: staff.experience || "",
      publications: staff.publications,
      specializations: staff.specializations?.join(', ') || "",
      courses: staff.courses?.join(', ') || "",
      education: staff.education?.join(', ') || "",
      showOnLanding: staff.showOnLanding || false,
      position: staff.position || "",
      displayOrder: staff.displayOrder || 999,
    });
  };

  const handleSubmit = (data: StaffFormData) => {
    if (editingStaff) {
      updateStaffMutation.mutate({ id: editingStaff._id, data });
    } else {
      createStaffMutation.mutate(data);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to manage staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-staff-management">Staff Management</h2>
          <p className="text-muted-foreground">Manage faculty and staff profiles</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-add-staff"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {isLoadingStaff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff) => (
            <Card key={staff._id} className="overflow-hidden">
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage src={staff.avatar} alt={staff.name} />
                    <AvatarFallback className="text-lg font-semibold">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" data-testid={`text-name-${staff._id}`}>
                    {staff.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{staff.title}</p>
                  <p className="text-xs text-muted-foreground">{staff.department}</p>
                </div>
                {staff.showOnLanding && (
                  <Badge variant="secondary" className="mx-auto gap-1">
                    <Star className="h-3 w-3" />
                    Featured on Landing
                  </Badge>
                )}
                {staff.position && (
                  <Badge variant="outline" className="mx-auto">
                    {staff.position}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {staff.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{staff.bio}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(staff)}
                    data-testid={`button-edit-${staff._id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteStaffMutation.mutate(staff._id)}
                    disabled={deleteStaffMutation.isPending}
                    data-testid={`button-delete-${staff._id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || editingStaff !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingStaff(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {editingStaff 
                ? 'Update the staff member details below.'
                : 'Fill in the details to add a new staff member.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {!editingStaff && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoadingUsers}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-user">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user._id} value={user._id || ''}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Professor" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sociology" {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 301" {...field} data-testid="input-office" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief biography" 
                        {...field} 
                        data-testid="input-bio"
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10 years" {...field} data-testid="input-experience" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publications</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} data-testid="input-publications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Social Theory, Research Methods (comma-separated)" 
                        {...field} 
                        data-testid="input-specializations"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Separate multiple items with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courses</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., SOC 101, SOC 201 (comma-separated)" 
                        {...field} 
                        data-testid="input-courses"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Separate multiple items with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., PhD in Sociology, MA in Social Work (comma-separated)" 
                        {...field} 
                        data-testid="input-education"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Separate multiple items with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Landing Page Settings */}
              <div className="border rounded-md p-4 space-y-4 bg-muted/50">
                <h3 className="font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Landing Page Settings
                </h3>

                <FormField
                  control={form.control}
                  name="showOnLanding"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <FormLabel>Show on Landing Page</FormLabel>
                        <FormDescription className="text-xs">
                          Display this staff member on the home page
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-show-landing"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('showOnLanding') && (
                  <>
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position/Role</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., President, V.President, Financial Secretary" 
                              {...field} 
                              data-testid="input-position"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Executive position to display on landing page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="999" 
                              {...field} 
                              data-testid="input-display-order"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Lower numbers appear first (e.g., 1, 2, 3...)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingStaff(null);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                  data-testid="button-submit-staff"
                >
                  {editingStaff ? 'Update' : 'Add'} Staff Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
