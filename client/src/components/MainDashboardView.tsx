import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultipleImageUpload } from "@/components/ui/multiple-image-upload";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GamificationDashboard from "./GamificationDashboard";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Plus, Edit, Trash2, FileText, Calendar, Eye, Heart, Star, Download, MapPin, Clock, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { blogPostSchema, eventSchema, learningResourceSchema, staffProfileSchema, staffProfileBaseSchema, userSchema } from "@shared/mongoSchema";

// Use shared types
type BlogPost = z.infer<typeof blogPostSchema>;
type Event = z.infer<typeof eventSchema>;
type LearningResource = z.infer<typeof learningResourceSchema>;
type StaffProfile = z.infer<typeof staffProfileSchema>;
type User = z.infer<typeof userSchema>;

// Form validation schema based on shared schema
const blogFormSchema = blogPostSchema.omit({ 
  _id: true, 
  authorId: true, 
  createdAt: true, 
  updatedAt: true, 
  likes: true, 
  views: true, 
  readTime: true 
}).extend({
  tags: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  imageUrls: z.array(z.string()).optional().default([])
});

type BlogFormData = z.infer<typeof blogFormSchema>;

// Event form validation schema
const eventFormSchema = eventSchema.omit({ 
  _id: true, 
  organizerId: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  date: z.string().min(1, "Date is required"), // Transform Date to string for form input
  tags: z.string().optional(), // Transform array to comma-separated string for form input
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal(""))
});

type EventFormData = z.infer<typeof eventFormSchema>;

// Learning Resource form validation schema
const resourceFormSchema = learningResourceSchema.omit({ 
  _id: true, 
  uploadedById: true, 
  createdAt: true, 
  updatedAt: true,
  downloads: true,
  rating: true,
  ratingCount: true
}).extend({
  tags: z.string().optional(), // Transform array to comma-separated string for form input
  fileUrl: z.string().url("File URL is required").min(1, "File is required"),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal(""))
});

type ResourceFormData = z.infer<typeof resourceFormSchema>;

// Staff Profile form validation schema
const staffFormSchema = staffProfileBaseSchema.omit({ 
  _id: true,
  createdAt: true, 
  updatedAt: true,
  userId: true
}).extend({
  customName: z.string().min(1, "Staff member name is required"),
  specializations: z.string().optional(),
  courses: z.string().optional(),
  education: z.string().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional()
});

type StaffFormData = z.infer<typeof staffFormSchema>;

export default function MainDashboardView() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show different dashboard based on user role
  switch (user.role) {
    case 'super_admin':
      return <AnalyticsDashboard userRole="super_admin" />;
    case 'admin':
      return <AnalyticsDashboard userRole="admin" />;
    case 'student':
      return <GamificationDashboard user={user} />;
    default:
      return <GamificationDashboard user={user} />;
  }
}

export function UserManagementView() {
  const { user } = useAuth();
  
  // Only allow admin and super_admin access
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

export function StudentGamificationView() {
  const { user } = useAuth();
  
  // Only allow students access to gamification
  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Student Access Only</h2>
          <p className="text-gray-600 dark:text-gray-400">This section is available only to students.</p>
        </div>
      </div>
    );
  }

  return <GamificationDashboard user={user} />;
}

export function AnalyticsView() {
  const { user } = useAuth();
  
  // Only allow admin and super_admin access
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Admin Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to view analytics.</p>
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard userRole={user.role as 'admin' | 'super_admin'} />;
}

// Blog Form Modal Component
function BlogFormModal({ 
  isOpen, 
  onClose, 
  blog, 
  onSubmit, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  blog: BlogPost | null; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog?.title || "",
      excerpt: blog?.excerpt || "",
      content: blog?.content || "",
      category: blog?.category || "",
      tags: blog?.tags?.join(", ") || "",
      imageUrl: blog?.imageUrl || "",
      imageUrls: blog?.imageUrls || [],
      published: blog?.published || false,
      featured: blog?.featured || false
    }
  });

  // Reset form when blog changes (for editing different blogs)
  useEffect(() => {
    form.reset({
      title: blog?.title || "",
      excerpt: blog?.excerpt || "",
      content: blog?.content || "",
      category: blog?.category || "",
      tags: blog?.tags?.join(", ") || "",
      imageUrl: blog?.imageUrl || "",
      imageUrls: blog?.imageUrls || [],
      published: blog?.published || false,
      featured: blog?.featured || false
    });
  }, [blog, form]);

  const handleSubmit = (data: BlogFormData) => {
    const submitData = {
      ...data,
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      imageUrl: data.imageUrl || undefined,
      imageUrls: data.imageUrls || []
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{blog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter blog title..." {...field} data-testid="input-blog-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-blog-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Sociology">Sociology</SelectItem>
                          <SelectItem value="News">News</SelectItem>
                          <SelectItem value="Tutorial">Tutorial</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. psychology, research, education" {...field} data-testid="input-blog-tags" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      acceptedFormats="image"
                      folder="blogs"
                      label="Upload Featured Image"
                      description="Upload a featured image for your blog post (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Images</FormLabel>
                  <FormControl>
                    <MultipleImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      folder="blogs"
                      maxFiles={5}
                      label="Upload Multiple Images"
                      description="Upload up to 5 additional images to be displayed in your blog post (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of your blog post..." rows={3} {...field} data-testid="textarea-blog-excerpt" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your blog content here..." 
                      rows={10} 
                      {...field} 
                      data-testid="textarea-blog-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        data-testid="switch-blog-published"
                      />
                    </FormControl>
                    <FormLabel>Published</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        data-testid="switch-blog-featured" 
                      />
                    </FormControl>
                    <FormLabel>Featured</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 sm:flex-none"
                data-testid="button-cancel-blog-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 sm:flex-none"
                data-testid="button-submit-blog"
              >
                {isLoading ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Event Form Modal Component
function EventFormModal({ 
  isOpen, 
  onClose, 
  event, 
  onSubmit, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event: Event | null; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
      time: event?.time || "",
      location: event?.location || "",
      type: event?.type || 'workshop',
      capacity: event?.capacity || 50,
      price: event?.price || 0,
      tags: event?.tags?.join(", ") || "",
      imageUrl: event?.imageUrl || ""
    }
  });

  // Reset form when event changes (for editing different events)
  useEffect(() => {
    form.reset({
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
      time: event?.time || "",
      location: event?.location || "",
      type: event?.type || 'workshop',
      capacity: event?.capacity || 50,
      price: event?.price || 0,
      tags: event?.tags?.join(", ") || "",
      imageUrl: event?.imageUrl || ""
    });
  }, [event, form]);

  const handleSubmit = (data: EventFormData) => {
    const submitData = {
      ...data,
      date: new Date(data.date),
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      imageUrl: data.imageUrl || undefined
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title..." {...field} data-testid="input-event-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-event-type">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-event-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" {...field} data-testid="input-event-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Event venue..." {...field} data-testid="input-event-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Maximum attendees" {...field} onChange={e => field.onChange(parseInt(e.target.value))} data-testid="input-event-capacity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount in Naira</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))} data-testid="input-event-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. workshop, academic, networking" {...field} data-testid="input-event-tags" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      acceptedFormats="image"
                      folder="events"
                      label="Upload Event Image"
                      description="Upload an image for your event (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Event description..." 
                      rows={6} 
                      {...field} 
                      data-testid="textarea-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 sm:flex-none"
                data-testid="button-cancel-event-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 sm:flex-none"
                data-testid="button-submit-event"
              >
                {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Blog Management View with full CRUD functionality
export function BlogManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<BlogPost | null>(null);

  // Fetch blogs query
  const { data: blogs = [], isLoading, refetch } = useQuery<BlogPost[]>({
    queryKey: ['/api/blogs'],
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin')
  });

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: (blogData: any) => apiRequest('POST', '/api/blogs', blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Blog created successfully",
        description: "Your blog post has been published."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating blog",
        description: error.message || "Failed to create blog post",
        variant: "destructive"
      });
    }
  });

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blogData }: { id: string; blogData: any }) => apiRequest('PUT', `/api/blogs/${id}`, blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      setEditingBlog(null);
      toast({
        title: "Blog updated successfully",
        description: "Your changes have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating blog",
        description: error.message || "Failed to update blog post",
        variant: "destructive"
      });
    }
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/blogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      setDeletingBlog(null);
      toast({
        title: "Blog deleted successfully",
        description: "The blog post has been removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting blog",
        description: error.message || "Failed to delete blog post",
        variant: "destructive"
      });
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to manage blogs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage blog posts</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-create-blog"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Blog
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No blog posts yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first blog post to get started.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  data-testid="button-create-first-blog"
                  className="px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Blog
                </Button>
              </CardContent>
            </Card>
          ) : (
            blogs.map((blog: BlogPost) => (
              <Card key={blog._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold line-clamp-2">{blog.title}</h3>
                        {blog.featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant={blog.published ? "default" : "secondary"}>
                          {blog.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      
                      {blog.excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{blog.excerpt}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.views || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {blog.likes || 0} likes
                        </span>
                        <Badge variant="outline">{blog.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBlog(blog)}
                        className="flex-1 lg:flex-none"
                        data-testid={`button-edit-blog-${blog._id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingBlog(blog)}
                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        data-testid={`button-delete-blog-${blog._id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      <BlogFormModal
        isOpen={isCreateModalOpen || !!editingBlog}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBlog(null);
        }}
        blog={editingBlog}
        onSubmit={(blogData) => {
          if (editingBlog) {
            updateBlogMutation.mutate({ id: editingBlog._id!, blogData });
          } else {
            createBlogMutation.mutate(blogData);
          }
        }}
        isLoading={createBlogMutation.isPending || updateBlogMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingBlog} onOpenChange={() => setDeletingBlog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post "{deletingBlog?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBlog && deleteBlogMutation.mutate(deletingBlog._id!)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteBlogMutation.isPending}
              data-testid="button-confirm-delete-blog"
            >
              {deleteBlogMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function EventManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<Event | null>(null);

  // Fetch events query
  const { data: events = [], isLoading, refetch } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin')
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest('POST', '/api/events', eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Event created successfully",
        description: "Your event has been published."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating event",
        description: error.message || "Failed to create event",
        variant: "destructive"
      });
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, eventData }: { id: string; eventData: any }) => apiRequest('PUT', `/api/events/${id}`, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setEditingEvent(null);
      toast({
        title: "Event updated successfully",
        description: "Your changes have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating event",
        description: error.message || "Failed to update event",
        variant: "destructive"
      });
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setDeletingEvent(null);
      toast({
        title: "Event deleted successfully",
        description: "The event has been removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to manage events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage department events</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-create-event"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No events yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first event to get started.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  data-testid="button-create-first-event"
                  className="px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event: Event) => (
              <Card key={event._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span>{event.time}</span>
                        <span>{event.location}</span>
                        <span>Capacity: {event.capacity}</span>
                        {event.price > 0 && (
                          <span className="text-green-600">₦{event.price}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingRegistrations(event)}
                        className="flex-1 lg:flex-none"
                        data-testid={`button-view-registrations-${event._id}`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Registrations</span>
                        <span className="sm:hidden">Reg</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                        className="flex-1 lg:flex-none"
                        data-testid={`button-edit-event-${event._id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingEvent(event)}
                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        data-testid={`button-delete-event-${event._id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Event Modal */}
      <EventFormModal
        isOpen={isCreateModalOpen || !!editingEvent}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSubmit={(eventData) => {
          if (editingEvent) {
            updateEventMutation.mutate({ id: editingEvent._id!, eventData });
          } else {
            createEventMutation.mutate(eventData);
          }
        }}
        isLoading={createEventMutation.isPending || updateEventMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event "{deletingEvent?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEvent && deleteEventMutation.mutate(deletingEvent._id!)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteEventMutation.isPending}
              data-testid="button-confirm-delete-event"
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Registrations Modal */}
      {viewingRegistrations && (
        <EventRegistrationsModal
          event={viewingRegistrations}
          isOpen={!!viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}
    </div>
  );
}

// Event Registrations Modal Component
function EventRegistrationsModal({ 
  event, 
  isOpen, 
  onClose 
}: { 
  event: Event; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const { data: registrations = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/events/${event._id}/registrations`],
    enabled: isOpen && !!event._id
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Registrations - {event.title}</DialogTitle>
          <DialogDescription>
            View all registered users for this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8" data-testid="text-no-registrations">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No registrations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Total registrations: <span className="font-semibold">{registrations.length}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                {registrations.map((registration: any, index: number) => (
                  <Card 
                    key={registration._id || index} 
                    className="p-4"
                    data-testid={`card-registration-${registration._id || index}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        {registration.user ? (
                          <div className="space-y-1">
                            <p className="font-medium" data-testid={`text-user-name-${registration._id || index}`}>
                              {registration.user?.firstName || ''} {registration.user?.lastName || ''}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${registration._id || index}`}>
                              {registration.user?.email || 'Email not available'}
                            </p>
                          </div>
                        ) : (
                          <p className="font-medium text-muted-foreground" data-testid={`text-user-id-${registration._id || index}`}>
                            User ID: {registration.userId}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2" data-testid={`text-registration-date-${registration._id || index}`}>
                          Registered: {new Date(registration.createdAt).toLocaleDateString()} at {new Date(registration.createdAt).toLocaleTimeString()}
                        </p>
                        <Badge 
                          variant={registration.status === 'registered' ? 'default' : 'secondary'} 
                          className="mt-2"
                          data-testid={`badge-status-${registration._id || index}`}
                        >
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline" data-testid="button-close-registrations-modal">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Resource Form Modal Component
function ResourceFormModal({ 
  isOpen, 
  onClose, 
  resource, 
  onSubmit, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  resource: LearningResource | null; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: 'pdf',
      category: "",
      fileUrl: "",
      fileName: "",
      fileSize: "",
      difficulty: '100l',
      tags: "",
      previewAvailable: false,
      thumbnailUrl: ""
    }
  });

  // Reset form when resource changes (for edit mode)
  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title || "",
        description: resource.description || "",
        type: resource.type || 'pdf',
        category: resource.category || "",
        fileUrl: resource.fileUrl || "",
        fileName: resource.fileName || "",
        fileSize: resource.fileSize || "",
        difficulty: resource.difficulty || '100l',
        tags: resource.tags?.join(", ") || "",
        previewAvailable: resource.previewAvailable || false,
        thumbnailUrl: resource.thumbnailUrl || ""
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: 'pdf',
        category: "",
        fileUrl: "",
        fileName: "",
        fileSize: "",
        difficulty: '100l',
        tags: "",
        previewAvailable: false,
        thumbnailUrl: ""
      });
    }
  }, [resource, form]);

  const handleSubmit = (data: ResourceFormData) => {
    const submitData = {
      ...data,
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      thumbnailUrl: data.thumbnailUrl || undefined
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{resource ? "Edit Learning Resource" : "Upload New Learning Resource"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter resource title..." {...field} data-testid="input-resource-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Type *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-resource-type">
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Research Methods, Psychology" {...field} data-testid="input-resource-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-resource-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100l">100 Level</SelectItem>
                          <SelectItem value="200l">200 Level</SelectItem>
                          <SelectItem value="300l">300 Level</SelectItem>
                          <SelectItem value="400l">400 Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., research_methods.pdf" {...field} data-testid="input-resource-filename" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fileSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2.5 MB" {...field} data-testid="input-resource-filesize" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. research, methodology, statistics" {...field} data-testid="input-resource-tags" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="previewAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        data-testid="switch-resource-preview"
                      />
                    </FormControl>
                    <FormLabel>Preview Available</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Upload *</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      acceptedFormats="all"
                      folder="resources"
                      label="Upload Learning Resource"
                      description="Upload your learning resource file (PDFs, videos, documents, images)"
                      maxSize={50 * 1024 * 1024} // 50MB for learning resources
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image (Optional)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      acceptedFormats="image"
                      folder="resources/thumbnails"
                      label="Upload Thumbnail"
                      description="Upload a thumbnail image for your resource (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the learning resource..." 
                      rows={6} 
                      {...field} 
                      data-testid="textarea-resource-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 sm:flex-none"
                data-testid="button-cancel-resource-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 sm:flex-none"
                data-testid="button-submit-resource"
              >
                {isLoading ? "Saving..." : resource ? "Update Resource" : "Upload Resource"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<LearningResource | null>(null);

  // Fetch resources query
  const { data: resources = [], isLoading, refetch } = useQuery<LearningResource[]>({
    queryKey: ['/api/resources'],
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin')
  });

  // Create resource mutation
  const createResourceMutation = useMutation({
    mutationFn: (resourceData: any) => apiRequest('POST', '/api/resources', resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Resource created successfully",
        description: "Your learning resource has been uploaded."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating resource",
        description: error.message || "Failed to create resource",
        variant: "destructive"
      });
    }
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: ({ id, resourceData }: { id: string; resourceData: any }) => apiRequest('PUT', `/api/resources/${id}`, resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setEditingResource(null);
      toast({
        title: "Resource updated successfully",
        description: "Your changes have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating resource",
        description: error.message || "Failed to update resource",
        variant: "destructive"
      });
    }
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      setDeletingResource(null);
      toast({
        title: "Resource deleted successfully",
        description: "The resource has been removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting resource",
        description: error.message || "Failed to delete resource",
        variant: "destructive"
      });
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to manage learning resources.</p>
        </div>
      </div>
    );
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'video':
        return <Eye className="w-8 h-8 text-purple-500" />;
      case 'image':
        return <FileText className="w-8 h-8 text-blue-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Learning Resources</h2>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage educational materials</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-create-resource"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload New Resource
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {resources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your first learning resource to get started.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  data-testid="button-create-first-resource"
                  className="px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Resource
                </Button>
              </CardContent>
            </Card>
          ) : (
            resources.map((resource: LearningResource) => (
              <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex items-center space-x-3">
                      {getResourceIcon(resource.type)}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold line-clamp-2">{resource.title}</h3>
                          <Badge variant="outline">{resource.type.toUpperCase()}</Badge>
                          <Badge variant={resource.difficulty === '100l' ? 'default' : resource.difficulty === '200l' ? 'secondary' : resource.difficulty === '300l' ? 'outline' : 'destructive'}>
                            {resource.difficulty.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {resource.description && (
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{resource.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {resource.downloads || 0} downloads
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {((resource.rating || 0) / 10).toFixed(1)} rating
                          </span>
                          <span>{resource.fileSize}</span>
                          <Badge variant="outline">{resource.category}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingResource(resource)}
                        className="flex-1 lg:flex-none"
                        data-testid={`button-edit-resource-${resource._id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingResource(resource)}
                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        data-testid={`button-delete-resource-${resource._id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Resource Modal */}
      <ResourceFormModal
        isOpen={isCreateModalOpen || !!editingResource}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingResource(null);
        }}
        resource={editingResource}
        onSubmit={(resourceData) => {
          if (editingResource) {
            updateResourceMutation.mutate({ id: editingResource._id!, resourceData });
          } else {
            createResourceMutation.mutate(resourceData);
          }
        }}
        isLoading={createResourceMutation.isPending || updateResourceMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingResource} onOpenChange={() => setDeletingResource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource "{deletingResource?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingResource && deleteResourceMutation.mutate(deletingResource._id!)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteResourceMutation.isPending}
              data-testid="button-confirm-delete-resource"
            >
              {deleteResourceMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Profile update form
  const profileForm = useForm({
    resolver: zodResolver(z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      profileImageUrl: z.union([z.string().url(), z.literal("")]).optional()
    })),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      profileImageUrl: user?.profileImageUrl || ""
    }
  });

  // Password change form
  const passwordForm = useForm({
    resolver: zodResolver(z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password")
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    })),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Notification preferences form
  const notificationForm = useForm({
    resolver: zodResolver(z.object({
      emailNotifications: z.boolean(),
      pushNotifications: z.boolean(),
      blogNotifications: z.boolean(),
      eventNotifications: z.boolean(),
      resourceNotifications: z.boolean()
    })),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      blogNotifications: true,
      eventNotifications: true,
      resourceNotifications: true
    }
  });

  // Theme preferences
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => apiRequest('PUT', '/api/user/profile', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: any) => apiRequest('PUT', '/api/user/password', passwordData),
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      passwordForm.reset();
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error changing password",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    }
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (notificationData: any) => apiRequest('PUT', '/api/user/notifications', notificationData),
    onSuccess: () => {
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating notifications",
        description: error.message || "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  });

  const handleProfileUpdate = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: any) => {
    changePasswordMutation.mutate(data);
  };

  const handleNotificationUpdate = (data: any) => {
    updateNotificationsMutation.mutate(data);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // Apply theme to document
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    localStorage.setItem("theme", newTheme);
    toast({
      title: "Theme updated",
      description: `Theme changed to ${newTheme} mode.`
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please log in</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            acceptedFormats="image"
                            folder="profiles"
                            label="Upload Profile Picture"
                            description="Upload a profile picture (optional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Role:</strong> {user.role}</p>
                      <p><strong>Status:</strong> {user.approvalStatus}</p>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-update-profile"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(handleNotificationUpdate)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>Receive notifications via email</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-email-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="blogNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Blog Updates</FormLabel>
                            <FormDescription>Get notified about new blog posts</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-blog-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="eventNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Event Updates</FormLabel>
                            <FormDescription>Get notified about upcoming events</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-event-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="resourceNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>New Resources</FormLabel>
                            <FormDescription>Get notified about new learning resources</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-resource-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={updateNotificationsMutation.isPending}
                    data-testid="button-update-notifications"
                  >
                    {updateNotificationsMutation.isPending ? "Updating..." : "Save Preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Theme Preference</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => handleThemeChange("light")}
                      className="flex flex-col items-center p-4 h-auto"
                      data-testid="button-theme-light"
                    >
                      <Eye className="w-6 h-6 mb-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => handleThemeChange("dark")}
                      className="flex flex-col items-center p-4 h-auto"
                      data-testid="button-theme-dark"
                    >
                      <Eye className="w-6 h-6 mb-2" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => handleThemeChange("system")}
                      className="flex flex-col items-center p-4 h-auto"
                      data-testid="button-theme-system"
                    >
                      <Eye className="w-6 h-6 mb-2" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full justify-start"
                data-testid="button-change-password"
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteAccountModalOpen(true)}
                data-testid="button-delete-account"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} data-testid="input-confirm-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-password-change"
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog open={isDeleteAccountModalOpen} onOpenChange={setIsDeleteAccountModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete-account"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Staff Form Modal Component
function StaffFormModal({ 
  isOpen, 
  onClose, 
  staff, 
  onSubmit, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  staff: (StaffProfile & { user?: User }) | null; 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      customName: staff?.customName || "",
      title: staff?.title || "",
      department: staff?.department || "",
      specializations: staff?.specializations?.join(", ") || "",
      office: staff?.office || "",
      bio: staff?.bio || "",
      courses: staff?.courses?.join(", ") || "",
      publications: staff?.publications || 0,
      experience: staff?.experience || "",
      education: staff?.education?.join(", ") || "",
      avatar: staff?.avatar || "",
      phone: staff?.phone || ""
    }
  });

  // Reset form when staff changes
  useEffect(() => {
    form.reset({
      customName: staff?.customName || "",
      title: staff?.title || "",
      department: staff?.department || "",
      specializations: staff?.specializations?.join(", ") || "",
      office: staff?.office || "",
      bio: staff?.bio || "",
      courses: staff?.courses?.join(", ") || "",
      publications: staff?.publications || 0,
      experience: staff?.experience || "",
      education: staff?.education?.join(", ") || "",
      avatar: staff?.avatar || "",
      phone: staff?.phone || ""
    });
  }, [staff, form]);

  const handleSubmit = (data: StaffFormData) => {
    const submitData = {
      ...data,
      specializations: data.specializations ? data.specializations.split(",").map(s => s.trim()).filter(Boolean) : [],
      courses: data.courses ? data.courses.split(",").map(c => c.trim()).filter(Boolean) : [],
      education: data.education ? data.education.split(",").map(e => e.trim()).filter(Boolean) : []
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{staff ? "Edit Staff Profile" : "Create New Staff Profile"}</DialogTitle>
          <DialogDescription>
            {staff ? "Update staff member information" : "Add a new staff member from approved users"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {!staff && (
                <FormField
                  control={form.control}
                  name="customName"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Staff Member Name *</FormLabel>
                      <Input 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Enter staff member name (e.g., Dr. John Smith)" 
                        data-testid="input-staff-name"
                      />
                      <FormDescription>
                        Enter the full name of the staff member
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Avatar Upload */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="staff-avatars"
                      label="Avatar / Profile Picture"
                      description="Upload a profile picture for the staff member"
                      acceptedFormats="image"
                      maxSize={5 * 1024 * 1024}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., +234 123 456 7890" 
                        {...field} 
                        data-testid="input-staff-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Professor of Sociology" {...field} data-testid="input-staff-title" />
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
                      <Input placeholder="e.g., Department of Sociology" {...field} data-testid="input-staff-department" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Specializations (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Social Psychology, Research Methods" {...field} data-testid="input-staff-specializations" />
                    </FormControl>
                    <FormDescription>Separate multiple specializations with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 305, Sociology Building" {...field} data-testid="input-staff-office" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 15+ Years" {...field} data-testid="input-staff-experience" />
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
                    <FormLabel>Number of Publications</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-staff-publications" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="courses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Courses (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to Sociology, Research Methods" {...field} data-testid="input-staff-courses" />
                  </FormControl>
                  <FormDescription>Separate multiple courses with commas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ph.D. in Sociology - Harvard University" {...field} data-testid="input-staff-education" />
                  </FormControl>
                  <FormDescription>Separate multiple degrees with commas</FormDescription>
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
                      placeholder="Brief biography..." 
                      rows={5} 
                      {...field} 
                      data-testid="textarea-staff-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 sm:flex-none"
                data-testid="button-cancel-staff-form"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 sm:flex-none"
                data-testid="button-submit-staff"
              >
                {isLoading ? "Saving..." : staff ? "Update Staff" : "Create Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffManagementView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<(StaffProfile & { user?: User }) | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffProfile | null>(null);

  // Fetch staff profiles query
  const { data: staffProfiles = [], isLoading, refetch } = useQuery<(StaffProfile & { user?: User })[]>({
    queryKey: ['/api/staff'],
    enabled: !!user && (user.role === 'admin' || user.role === 'super_admin')
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: (staffData: any) => apiRequest('POST', '/api/staff', staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      setIsCreateModalOpen(false);
      toast({
        title: "Staff profile created successfully",
        description: "The staff member has been added."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating staff profile",
        description: error.message || "Failed to create staff profile",
        variant: "destructive"
      });
    }
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, staffData }: { id: string; staffData: any }) => apiRequest('PUT', `/api/staff/${id}`, staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      setEditingStaff(null);
      toast({
        title: "Staff profile updated successfully",
        description: "Your changes have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating staff profile",
        description: error.message || "Failed to update staff profile",
        variant: "destructive"
      });
    }
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      setDeletingStaff(null);
      toast({
        title: "Staff profile deleted successfully",
        description: "The staff member has been removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting staff profile",
        description: error.message || "Failed to delete staff profile",
        variant: "destructive"
      });
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to manage staff profiles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage faculty and staff profiles</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
          data-testid="button-create-staff"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {staffProfiles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No staff profiles yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add your first staff member to get started.
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  data-testid="button-create-first-staff"
                  className="px-6 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Staff
                </Button>
              </CardContent>
            </Card>
          ) : (
            staffProfiles.map((staffProfile) => (
              <Card key={staffProfile._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {staffProfile.user?.firstName} {staffProfile.user?.lastName}
                        </h3>
                        <Badge variant="outline">{staffProfile.department}</Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 font-medium">{staffProfile.title}</p>
                      
                      {staffProfile.bio && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{staffProfile.bio}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {staffProfile.office && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {staffProfile.office}
                          </span>
                        )}
                        {staffProfile.experience && (
                          <span>{staffProfile.experience}</span>
                        )}
                        <span>{staffProfile.publications || 0} publications</span>
                        {staffProfile.specializations && staffProfile.specializations.length > 0 && (
                          <span>{staffProfile.specializations.length} specializations</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStaff(staffProfile)}
                        className="flex-1 lg:flex-none"
                        data-testid={`button-edit-staff-${staffProfile._id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingStaff(staffProfile)}
                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        data-testid={`button-delete-staff-${staffProfile._id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Staff Modal */}
      <StaffFormModal
        isOpen={isCreateModalOpen || !!editingStaff}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingStaff(null);
        }}
        staff={editingStaff}
        onSubmit={(staffData) => {
          if (editingStaff) {
            updateStaffMutation.mutate({ id: editingStaff._id!, staffData });
          } else {
            createStaffMutation.mutate(staffData);
          }
        }}
        isLoading={createStaffMutation.isPending || updateStaffMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingStaff} onOpenChange={() => setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingStaff && deleteStaffMutation.mutate(deletingStaff._id!)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteStaffMutation.isPending}
              data-testid="button-confirm-delete-staff"
            >
              {deleteStaffMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}