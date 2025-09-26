import StudentDashboard from '../StudentDashboard'

export default function StudentDashboardExample() {
  // todo: remove mock functionality
  const mockStudent = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    level: "300 Level",
    matricNumber: "soc/2021/001",
    profileCompletion: 75,
    approvalStatus: 'approved' as const
  };

  const mockStats = {
    blogPosts: 8,
    comments: 24,
    downloads: 12,
    badges: 5
  };

  const mockRecentActivity = [
    {
      id: "1",
      type: 'blog' as const,
      title: "Published: Understanding Social Psychology",
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      type: 'comment' as const,
      title: "Commented on: Research Methods in Social Science",
      timestamp: "2024-01-14T15:45:00Z"
    },
    {
      id: "3",
      type: 'download' as const,
      title: "Downloaded: Statistical Analysis Guide",
      timestamp: "2024-01-14T09:20:00Z"
    },
    {
      id: "4",
      type: 'badge' as const,
      title: "Earned: Community Contributor Badge",
      timestamp: "2024-01-13T16:00:00Z"
    }
  ];

  const mockUpcomingEvents = [
    {
      id: "1",
      title: "Social Innovation Summit 2024",
      date: "Feb 20",
      time: "9:00 AM"
    },
    {
      id: "2",
      title: "Research Methods Workshop",
      date: "Feb 25",
      time: "2:00 PM"
    },
    {
      id: "3",
      title: "Psychology Study Group",
      date: "Mar 1",
      time: "4:00 PM"
    }
  ];

  const mockRecommendedBlogs = [
    {
      id: "1",
      title: "Advanced Statistical Methods for Social Research",
      author: "Dr. Sarah Johnson",
      readTime: 12
    },
    {
      id: "2",
      title: "Understanding Group Dynamics in Modern Society",
      author: "Prof. Michael Chen",
      readTime: 8
    },
    {
      id: "3",
      title: "Digital Ethics in Social Science Research",
      author: "Dr. Emma Wilson",
      readTime: 15
    }
  ];

  const mockBadges = [
    {
      id: "1",
      name: "First Blog",
      icon: "📝",
      description: "Published your first blog post",
      earned: true
    },
    {
      id: "2",
      name: "Commenter",
      icon: "💬",
      description: "Left 10 thoughtful comments",
      earned: true
    },
    {
      id: "3",
      name: "Scholar",
      icon: "🎓",
      description: "Downloaded 50 resources",
      earned: false
    },
    {
      id: "4",
      name: "Networker",
      icon: "🤝",
      description: "Attended 5 events",
      earned: true
    },
    {
      id: "5",
      name: "Mentor",
      icon: "👨‍🏫",
      description: "Helped other students",
      earned: false
    },
    {
      id: "6",
      name: "Researcher",
      icon: "🔬",
      description: "Contributed to research",
      earned: true
    }
  ];

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <StudentDashboard 
        student={mockStudent}
        stats={mockStats}
        recentActivity={mockRecentActivity}
        upcomingEvents={mockUpcomingEvents}
        recommendedBlogs={mockRecommendedBlogs}
        badges={mockBadges}
      />
    </div>
  );
}