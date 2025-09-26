import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  BookOpen,
  MessageSquare,
  Download,
  Heart,
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";

interface GamificationDashboardProps {
  user: any;
}

export default function GamificationDashboard({ user }: GamificationDashboardProps) {
  // Fetch real gamification data
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/gamification/user-stats', user._id],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ['/api/gamification/leaderboard'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: badges = [], isLoading: badgesLoading, error: badgesError } = useQuery({
    queryKey: ['/api/gamification/badges', user._id],
    refetchInterval: 60000
  });

  const isLoading = statsLoading || leaderboardLoading || badgesLoading;
  const hasError = statsError || leaderboardError || badgesError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Your Progress</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {statsError ? 'Unable to fetch your stats. ' : ''}
            {leaderboardError ? 'Unable to fetch leaderboard. ' : ''}
            {badgesError ? 'Unable to fetch your badges. ' : ''}
            Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            data-testid="button-refresh"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !userStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Map badges data to include icons
  const badgesWithIcons = badges.map((badge: any) => {
    const iconMapping = {
      "First Comment": MessageSquare,
      "Resource Explorer": BookOpen, 
      "Active Participant": Users,
      "Popular Contributor": Heart,
      "Streak Master": Target,
      "Scholar": Trophy,
    };
    return {
      ...badge,
      icon: iconMapping[badge.name as keyof typeof iconMapping] || Award
    };
  });

  const progressToNext = userStats.xpToNext > 0 ? ((1000 - userStats.xpToNext) / 1000) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Progress</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      {/* User Level & Progress */}
      <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white" data-testid="card-user-progress">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {userStats.level}</h3>
                <p className="text-purple-100">
                  {userStats.xp} / {userStats.xpToNext} XP
                </p>
                <Progress value={progressToNext} className="w-48 h-2 mt-2 bg-white/20" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userStats.totalBadges}</div>
              <div className="text-purple-100 text-sm">Badges Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="space-y-4">
          <Card data-testid="card-quick-stats">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Comments</span>
                </div>
                <Badge variant="secondary">{userStats.totalComments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span>Downloads</span>
                </div>
                <Badge variant="secondary">{userStats.totalDownloads}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span>Likes Received</span>
                </div>
                <Badge variant="secondary">{userStats.blogLikes}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Current Streak</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  {userStats.streak} days
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card data-testid="card-recent-achievements">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.time}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      +{achievement.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <Card data-testid="card-badges">
          <CardHeader>
            <CardTitle>Badges Collection</CardTitle>
            <CardDescription>Achievements unlocked through your activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      badge.earned
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      badge.earned ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <h4 className={`font-medium text-xs ${
                      badge.earned ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500'
                    }`}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card data-testid="card-leaderboard">
          <CardHeader>
            <CardTitle>Department Leaderboard</CardTitle>
            <CardDescription>Top contributors this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((member, index) => (
                <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
                  member.name.includes(user.firstName) ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : ''
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Level {member.level} • {member.xp} XP
                    </p>
                  </div>
                  {index < 3 && (
                    <Trophy className={`w-4 h-4 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      'text-orange-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}