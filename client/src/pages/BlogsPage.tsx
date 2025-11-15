import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import BlogCard from "@/components/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import type { BlogPost } from "@shared/mongoSchema";

export default function BlogsPage() {
  const [, setLocation] = useLocation();
  
  const { data: blogs, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blogs'],
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load blog posts. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold" data-testid="heading-blogs">Blog Posts</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of articles, research insights, and academic discussions
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: any) => {
            // Transform blog data to match BlogCard props
            const transformedBlog = {
              id: blog._id || '',
              title: blog.title,
              excerpt: blog.excerpt || '',
              content: blog.content,
              author: {
                name: blog.authorName || 'Unknown Author',
                avatar: blog.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.authorId}`,
                level: 'Author',
              },
              category: blog.category,
              publishedAt: new Date(blog.createdAt).toISOString().split('T')[0],
              readTime: blog.readTime,
              likes: blog.likes,
              comments: blog.commentCount || 0,
              views: blog.views,
              imageUrl: blog.imageUrl,
              imageUrls: blog.imageUrls,
              tags: blog.tags,
            };

            return (
              <BlogCard 
                key={blog._id} 
                blog={transformedBlog}
                isLikedByUser={blog.isLikedByUser || false}
                onReadMore={(id) => setLocation(`/blogs/${id}`)}
                onComment={(id) => setLocation(`/blogs/${id}#comments`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-no-blogs">
            No blog posts available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
