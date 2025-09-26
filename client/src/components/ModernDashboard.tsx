import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  BookOpen, 
  Settings, 
  Home,
  UserCheck,
  MessageSquare,
  Award,
  TrendingUp,
  Eye,
  Download,
  Heart,
  Shield,
  Bell,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["student", "admin", "super_admin"] },
  { icon: Users, label: "User Management", path: "/dashboard/users", roles: ["admin", "super_admin"] },
  { icon: FileText, label: "Blog Management", path: "/dashboard/blogs", roles: ["admin", "super_admin"] },
  { icon: Calendar, label: "Events", path: "/dashboard/events", roles: ["admin", "super_admin", "student"] },
  { icon: BookOpen, label: "Learning Resources", path: "/dashboard/resources", roles: ["admin", "super_admin", "student"] },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics", roles: ["admin", "super_admin"] },
  { icon: Award, label: "Gamification", path: "/dashboard/gamification", roles: ["student"] },
  { icon: MessageSquare, label: "My Posts", path: "/dashboard/my-posts", roles: ["student"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", roles: ["student", "admin", "super_admin"] },
];

interface ModernDashboardProps {
  children: React.ReactNode;
}

export default function ModernDashboard({ children }: ModernDashboardProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please log in to access the dashboard</h2>
        </div>
      </div>
    );
  }

  const filteredSidebarItems = sidebarItems.filter(item => 
    item.roles.includes(user.role as any)
  );

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "bg-slate-900 dark:bg-slate-950 text-white flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">Nsasa Portal</h1>
                <p className="text-slate-400 text-sm">Social Science Dept</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-blue-600">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email
                  }
                </p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700",
                    sidebarCollapsed ? "px-2" : "px-3"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
                  {!sidebarCollapsed && item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
              sidebarCollapsed ? "px-2" : "px-3"
            )}
            data-testid="button-logout"
          >
            <LogOut className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
            {!sidebarCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                data-testid="button-toggle-sidebar"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.role === 'super_admin' ? 'Super Admin Dashboard' : 
                   user.role === 'admin' ? 'Admin Dashboard' : 
                   'Student Dashboard'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user.firstName || 'User'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </Button>
              {user.role !== 'student' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}