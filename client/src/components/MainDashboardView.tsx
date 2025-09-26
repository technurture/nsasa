import { useAuth } from "@/hooks/useAuth";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GamificationDashboard from "./GamificationDashboard";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

export default function MainDashboardView() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show different dashboard based on user role
  switch (user.role) {
    case 'super_admin':
      return <AnalyticsDashboard userRole="super_admin" />;
    case 'admin':
      return <AnalyticsDashboard userRole="admin" />;
    case 'student':
      return <GamificationDashboard user={user} />;
    default:
      return <GamificationDashboard user={user} />;
  }
}

export function UserManagementView() {
  const { user } = useAuth();
  
  // Only allow admin and super_admin access
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

export function StudentGamificationView() {
  const { user } = useAuth();
  
  // Only allow students access to gamification
  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Student Access Only</h2>
          <p className="text-gray-600 dark:text-gray-400">This section is available only to students.</p>
        </div>
      </div>
    );
  }

  return <GamificationDashboard user={user} />;
}

export function AnalyticsView() {
  const { user } = useAuth();
  
  // Only allow admin and super_admin access
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Admin Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to view analytics.</p>
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard userRole={user.role as 'admin' | 'super_admin'} />;
}

// Placeholder components for other routes
export function BlogManagementView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Blog Management</h2>
      <p className="text-gray-600 dark:text-gray-400">Manage blog posts, categories, and content.</p>
      {/* TODO: Implement blog management interface */}
    </div>
  );
}

export function EventManagementView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Management</h2>
      <p className="text-gray-600 dark:text-gray-400">Create and manage department events.</p>
      {/* TODO: Implement event management interface */}
    </div>
  );
}

export function ResourceManagementView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning Resources</h2>
      <p className="text-gray-600 dark:text-gray-400">Access and manage educational resources.</p>
      {/* TODO: Implement resource management interface */}
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences.</p>
      {user && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.approvalStatus}</p>
          </div>
        </div>
      )}
      {/* TODO: Implement full settings interface */}
    </div>
  );
}