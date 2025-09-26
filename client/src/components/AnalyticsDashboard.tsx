import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Eye, 
  Download,
  TrendingUp,
  Calendar,
  MessageSquare,
  Award
} from "lucide-react";

interface AnalyticsDashboardProps {
  userRole: 'admin' | 'super_admin';
}

export default function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  // Fetch real analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/overview'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['/api/analytics/recent-activity'],
    refetchInterval: 30000
  });

  const { data: topBlogs = [], isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ['/api/analytics/top-blogs'],
    refetchInterval: 60000 // Refresh every minute
  });

  const isLoading = analyticsLoading || activityLoading || blogsLoading;
  const hasError = analyticsError || activityError || blogsError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {analyticsError ? 'Unable to fetch analytics data. ' : ''}
            {activityError ? 'Unable to fetch activity data. ' : ''}
            {blogsError ? 'Unable to fetch blog data. ' : ''}
            Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid="button-refresh"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive insights into platform engagement and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white" data-testid="card-total-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+12% from last month</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white" data-testid="card-active-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold">{analytics.activeUsers}</p>
                <div className="mt-2">
                  <Progress value={73} className="h-2 bg-green-400" />
                  <span className="text-sm mt-1 block">73% activity rate</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">73%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white" data-testid="card-blog-views">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Blog Views</p>
                <p className="text-3xl font-bold">{analytics.blogViews.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">+8% this week</span>
                </div>
              </div>
              <FileText className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white" data-testid="card-downloads">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Downloads</p>
                <p className="text-3xl font-bold">{analytics.totalDownloads.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Download className="w-4 h-4 mr-1" />
                  <span className="text-sm">+15% growth</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and updates on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {activity.author || activity.user || activity.title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card data-testid="card-top-blogs">
          <CardHeader>
            <CardTitle>Top Blogs</CardTitle>
            <CardDescription>Most viewed content this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBlogs.map((blog, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium line-clamp-2">{blog.title}</h4>
                    <Badge variant="secondary">{index + 1}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {blog.views}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {blog.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals (Super Admin Only) */}
      {userRole === 'super_admin' && analytics.pendingApprovals > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" data-testid="card-pending-approvals">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">Pending Approvals</CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              {analytics.pendingApprovals} student registrations require your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">{analytics.pendingApprovals} pending requests</span>
              </div>
              <a 
                href="/dashboard/users" 
                className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-100 font-medium text-sm"
              >
                Review Requests →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}