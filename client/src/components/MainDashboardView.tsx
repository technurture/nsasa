import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GamificationDashboard from "./GamificationDashboard";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, FileText, Calendar, Eye, Heart, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Types
interface BlogPost {
  _id?: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  featured: boolean;
  likes: number;
  views: number;
  readTime: number;
  createdAt: string;
  authorId: string;
}

// Form validation schema
const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  published: z.boolean(),
  featured: z.boolean()
});

type BlogFormData = z.infer<typeof blogFormSchema>;

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
      published: blog?.published || false,
      featured: blog?.featured || false
    }
  });

  const handleSubmit = (data: BlogFormData) => {
    const submitData = {
      ...data,
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      imageUrl: data.imageUrl || undefined
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
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
                          <SelectItem value="Social Science">Social Science</SelectItem>
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
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-blog-image" />
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
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
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
                <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-blog">
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
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingBlog(blog)}
                        className="flex-1 lg:flex-none text-red-600 hover:bg-red-50"
                        data-testid={`button-delete-blog-${blog._id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
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
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Management</h2>
      <p className="text-gray-600 dark:text-gray-400">Create and manage department events.</p>
      {/* TODO: Implement event management interface */}
    </div>
  );
}

export function ResourceManagementView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning Resources</h2>
      <p className="text-gray-600 dark:text-gray-400">Access and manage educational resources.</p>
      {/* TODO: Implement resource management interface */}
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences.</p>
      {user && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.approvalStatus}</p>
          </div>
        </div>
      )}
      {/* TODO: Implement full settings interface */}
    </div>
  );
}