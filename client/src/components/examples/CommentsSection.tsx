import CommentsSection from '../CommentsSection'

export default function CommentsSectionExample() {
  // todo: remove mock functionality
  const mockCurrentUser = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
  };

  const mockComments = [
    {
      id: "1",
      content: "This is an excellent analysis of social psychology trends. The way you've connected theory to modern digital society really resonates with my own research. I'm particularly interested in the section about group dynamics - have you considered how social media algorithms might be amplifying these effects?",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        level: "Professor"
      },
      timestamp: "2024-01-15T10:30:00Z",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: "2",
          content: "Thank you for the thoughtful feedback, Dr. Johnson! You raise an excellent point about social media algorithms. I think this could be a fascinating area for future research. The algorithmic curation of content certainly seems to create echo chambers that reinforce existing group behaviors.",
          author: {
            name: "Michael Chen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
            level: "400 Level"
          },
          timestamp: "2024-01-15T14:20:00Z",
          likes: 8,
          isLiked: true
        }
      ]
    },
    {
      id: "3",
      content: "As a 200-level student, I found this post really helpful for understanding the concepts we've been covering in class. The real-world examples made everything click for me. Could you recommend any additional reading on this topic?",
      author: {
        name: "Emma Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        level: "200 Level"
      },
      timestamp: "2024-01-15T16:45:00Z",
      likes: 5,
      isLiked: false,
      replies: []
    },
    {
      id: "4",
      content: "Great post! This aligns perfectly with what we discussed in last week's seminar. I'd love to see more content like this that bridges theoretical concepts with practical applications.",
      author: {
        name: "Alex Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        level: "300 Level"
      },
      timestamp: "2024-01-16T09:15:00Z",
      likes: 3,
      isLiked: false,
      replies: []
    }
  ];

  const handleAddComment = (content: string, parentId?: string) => {
    console.log('Adding comment:', { content, parentId });
  };

  const handleLikeComment = (commentId: string) => {
    console.log('Liking comment:', commentId);
  };

  const handleReportComment = (commentId: string) => {
    console.log('Reporting comment:', commentId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <CommentsSection 
        comments={mockComments}
        currentUser={mockCurrentUser}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReportComment={handleReportComment}
      />
    </div>
  );
}