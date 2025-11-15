import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  LogOut,
  UserCog,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const DASHBOARD_BASE = "/dashboard";

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/", roles: ["student", "admin", "super_admin"] },
  { icon: Users, label: "User Management", path: "/users", roles: ["admin", "super_admin"] },
  { icon: FileText, label: "Blog Management", path: "/blogs", roles: ["admin", "super_admin"] },
  { icon: Calendar, label: "Events", path: "/events", roles: ["admin", "super_admin", "student"] },
  { icon: BookOpen, label: "Learning Resources", path: "/resources", roles: ["admin", "super_admin", "student"] },
  { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["admin", "super_admin"] },
  { icon: Award, label: "Gamification", path: "/gamification", roles: ["student"] },
  { icon: MessageSquare, label: "My Posts", path: "/my-posts", roles: ["student"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["student", "admin", "super_admin"] },
];

interface ModernDashboardProps {
  children: React.ReactNode;
}

export default function ModernDashboard({ children }: ModernDashboardProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location]);

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
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-slate-900 dark:bg-slate-950 text-white flex flex-col transition-all duration-300 z-50",
        sidebarCollapsed ? "w-16" : "w-64",
        "md:relative fixed inset-y-0 left-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo/Header */}
        <div 
          onClick={() => window.location.href = '/'}
          className="p-6 border-b border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors" 
          data-testid="link-logo"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">Nsasa Portal</h1>
                <p className="text-slate-400 text-sm">Sociology Dept</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredSidebarItems.map((item) => {
            const Icon = item.icon;
            const fullPath = item.path === "/" ? DASHBOARD_BASE : `${DASHBOARD_BASE}${item.path}`;
            const isActive = location === fullPath;
            
            return (
              <Link key={item.path} href={fullPath}>
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
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex"
                data-testid="button-toggle-sidebar"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <div className="hidden sm:block">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {user.role === 'super_admin' ? 'Super Admin Dashboard' : 
                   user.role === 'admin' ? 'Admin Dashboard' : 
                   'Student Dashboard'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user.firstName || 'User'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user.role === 'super_admin' && (
                <Select onValueChange={(value) => {
                  if (value === 'user-management') {
                    setLocation('/dashboard/users');
                  } else if (value === 'analytics') {
                    setLocation('/dashboard/analytics');
                  } else if (value === 'permissions') {
                    setLocation('/dashboard/settings');
                  }
                }}>
                  <SelectTrigger className="w-[140px] h-8 bg-gray-50 dark:bg-gray-700" data-testid="select-role-management">
                    <UserCog className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Manage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user-management">User Roles</SelectItem>
                    <SelectItem value="permissions">Permissions</SelectItem>
                    <SelectItem value="analytics">System Analytics</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </Button>
              
              {/* User Profile with Badge */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email
                        }
                      </p>
                      {user.role !== 'student' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                          {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}