import BlogCard from '../BlogCard'

export default function BlogCardExample() {
  // todo: remove mock functionality
  const mockBlog = {
    id: "1",
    title: "Understanding Social Psychology in Modern Society",
    excerpt: "Explore the fascinating world of social psychology and how it shapes our daily interactions, decision-making processes, and community behaviors in today's digital age.",
    content: "Full content would be here...",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      level: "Professor"
    },
    category: "Psychology",
    publishedAt: "2024-01-15",
    readTime: 8,
    likes: 24,
    comments: 12,
    views: 156,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop",
    tags: ["psychology", "society", "behavior", "research"]
  };

  const handleReadMore = (id: string) => {
    console.log(`Read more clicked for blog: ${id}`);
  };

  const handleLike = (id: string) => {
    console.log(`Like clicked for blog: ${id}`);
  };

  const handleComment = (id: string) => {
    console.log(`Comment clicked for blog: ${id}`);
  };

  const handleShare = (id: string) => {
    console.log(`Share clicked for blog: ${id}`);
  };

  const handleBookmark = (id: string) => {
    console.log(`Bookmark clicked for blog: ${id}`);
  };

  return (
    <div className="max-w-md">
      <BlogCard 
        blog={mockBlog}
        onReadMore={handleReadMore}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
      />
    </div>
  );
}