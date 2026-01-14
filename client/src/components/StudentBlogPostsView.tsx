import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultipleImageUpload } from "@/components/ui/multiple-image-upload";
import type { BlogPost } from "@shared/mongoSchema";

const BLOG_CATEGORIES = ["Psychology", "Research", "Academic", "Sociology", "News", "Tutorial", "Entertainment", "Others"];

export function StudentBlogPostsView() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
    const [deletingBlog, setDeletingBlog] = useState<BlogPost | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        tags: "",
        imageUrl: "",
        imageUrls: [] as string[]
    });


    // Fetch user's own blogs
    const { data: blogs = [], isLoading, error: fetchError, refetch } = useQuery<BlogPost[]>({
        queryKey: ['/api/user/blogs'],
        enabled: !!user,
        retry: 1
    });

    // Log fetch results
    useEffect(() => {
        if (fetchError) {
            console.error('Failed to fetch blogs:', fetchError);
            toast({
                title: "Error loading posts",
                description: (fetchError as any).message || "Failed to load your blog posts",
                variant: "destructive"
            });
        } else if (blogs) {
            console.log('✅ Fetched blogs:', blogs.length, 'posts');
        }
    }, [fetchError, blogs, toast]);

    // Filter blogs
    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === "" ||
                blog.title.toLowerCase().includes(searchLower) ||
                blog.category.toLowerCase().includes(searchLower);
            const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [blogs, searchQuery, categoryFilter]);

    // Create blog mutation
    const createBlogMutation = useMutation({
        mutationFn: (blogData: any) => apiRequest('POST', '/api/blogs', blogData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/user/blogs'] });
            setIsCreateModalOpen(false);
            resetForm();
            toast({
                title: "Blog submitted successfully",
                description: "Your blog post is pending admin approval."
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
            queryClient.invalidateQueries({ queryKey: ['/api/user/blogs'] });
            setEditingBlog(null);
            resetForm();
            toast({
                title: "Blog updated successfully",
                description: "Your changes are pending admin approval."
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
            queryClient.invalidateQueries({ queryKey: ['/api/user/blogs'] });
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

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            excerpt: "",
            category: "",
            tags: "",
            imageUrl: "",
            imageUrls: []
        });
    };

    const handleOpenEdit = (blog: BlogPost) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt || "",
            category: blog.category,
            tags: blog.tags?.join(", ") || "",
            imageUrl: blog.imageUrl || "",
            imageUrls: blog.imageUrls || []
        });
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.content || !formData.category) {
            toast({
                title: "Missing required fields",
                description: "Please fill in title, content, and category",
                variant: "destructive"
            });
            return;
        }

        const blogData = {
            ...formData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            approvalStatus: 'pending' // Always pending for students
        };

        if (editingBlog) {
            updateBlogMutation.mutate({ id: editingBlog._id!, blogData });
        } else {
            createBlogMutation.mutate(blogData);
        }
    };

    const getApprovalBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">My Blog Posts</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create and manage your blog posts
                        {blogs.length > 0 && ` • ${blogs.length} total post${blogs.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <Button
                    onClick={() => { setIsCreateModalOpen(true); resetForm(); }}
                    className="w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {BLOG_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Blog Posts Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredBlogs.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">No blog posts found. Create your first post!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBlogs.map(blog => (
                        <Card key={blog._id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                                    {getApprovalBadge(blog.approvalStatus || 'pending')}
                                </div>
                                <CardDescription>{blog.category}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                    {blog.excerpt || blog.content.substring(0, 150)}...
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenEdit(blog)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeletingBlog(blog)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                                {blog.rejectionReason && (
                                    <p className="text-xs text-red-600 mt-2">Reason: {blog.rejectionReason}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isCreateModalOpen || !!editingBlog} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateModalOpen(false);
                    setEditingBlog(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                        <DialogDescription>
                            {editingBlog ? (
                                editingBlog.approvalStatus === 'approved'
                                    ? "Editing this approved post will require re-approval from an admin before changes are published"
                                    : "Update your blog post"
                            ) : "Your post will be reviewed by an admin before publishing"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter blog title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOG_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Brief description (optional)"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your blog content"
                                rows={8}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g. research, sociology, theory"
                            />
                        </div>
                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            label="Blog Cover Image"
                            description="Upload a cover image for your blog post"
                            folder="blog-images"
                            acceptedFormats="image"
                            maxSize={5 * 1024 * 1024}
                        />
                        <MultipleImageUpload
                            value={formData.imageUrls}
                            onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                            label="Additional Media"
                            description="Upload up to 5 additional images, videos, or documents for your blog post (optional)"
                            folder="blog-media"
                            maxFiles={5}
                            maxSize={10 * 1024 * 1024}
                            acceptedFormats="all"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsCreateModalOpen(false);
                            setEditingBlog(null);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={createBlogMutation.isPending || updateBlogMutation.isPending}>
                            {editingBlog ? "Update Post" : "Submit for Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletingBlog} onOpenChange={() => setDeletingBlog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Blog Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingBlog?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingBlog(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingBlog && deleteBlogMutation.mutate(deletingBlog._id!)}
                            disabled={deleteBlogMutation.isPending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
