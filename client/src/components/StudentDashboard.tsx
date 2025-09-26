import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Bell, 
  BookOpen, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  MessageCircle, 
  Download,
  Star,
  Clock,
  Users,
  FileText
} from "lucide-react";

interface StudentDashboardProps {
  student: {
    name: string;
    avatar?: string;
    level: string;
    matricNumber: string;
    profileCompletion: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };
  stats: {
    blogPosts: number;
    comments: number;
    downloads: number;
    badges: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'blog' | 'comment' | 'download' | 'badge';
    title: string;
    timestamp: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
  }>;
  recommendedBlogs: Array<{
    id: string;
    title: string;
    author: string;
    readTime: number;
  }>;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    earned: boolean;
  }>;
}

export default function StudentDashboard({ 
  student, 
  stats, 
  recentActivity, 
  upcomingEvents, 
  recommendedBlogs, 
  badges 
}: StudentDashboardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'blog': return <BookOpen className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'badge': return <Trophy className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="text-lg">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-welcome">
              Welcome back, {student.name}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{student.level} • {student.matricNumber}</span>
              <Badge className={getStatusColor(student.approvalStatus)} data-testid="badge-approval-status">
                {student.approvalStatus}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button data-testid="button-notifications">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>

      {/* Profile Completion */}
      {student.profileCompletion < 100 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Add more information to unlock all features
                </CardDescription>
              </div>
              <Badge variant="outline">{student.profileCompletion}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={student.profileCompletion} className="mb-4" />
            <Button size="sm" data-testid="button-complete-profile">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-blog-posts">{stats.blogPosts}</p>
                <p className="text-sm text-muted-foreground">Blog Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-comments">{stats.comments}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-downloads">{stats.downloads}</p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold" data-testid="stat-badges">{stats.badges}</p>
                <p className="text-sm text-muted-foreground">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg hover-elevate cursor-pointer">
                  <h4 className="font-medium line-clamp-2">{event.title}</h4>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full" data-testid="button-view-all-events">
                View All Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Blogs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>Based on your level and interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedBlogs.map((blog) => (
                <div key={blog.id} className="p-3 border rounded-lg hover-elevate cursor-pointer" data-testid={`blog-${blog.id}`}>
                  <h4 className="font-medium line-clamp-2">{blog.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>by {blog.author}</span>
                    <span>{blog.readTime} min read</span>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full" data-testid="button-view-all-blogs">
                View All Blogs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievement Badges
            </CardTitle>
            <CardDescription>Track your learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className={`p-3 border rounded-lg text-center transition-all ${
                  badge.earned 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'opacity-50 hover:opacity-75'
                }`} data-testid={`badge-${badge.id}`}>
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-badges">
              View All Badges
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col gap-1" data-testid="button-write-blog">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Write Blog</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col gap-1" data-testid="button-browse-resources">
              <Download className="h-5 w-5" />
              <span className="text-sm">Browse Resources</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col gap-1" data-testid="button-join-discussion">
              <Users className="h-5 w-5" />
              <span className="text-sm">Join Discussion</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col gap-1" data-testid="button-view-profile">
              <Star className="h-5 w-5" />
              <span className="text-sm">View Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}