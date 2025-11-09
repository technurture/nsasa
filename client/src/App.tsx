import { Switch, Route, useLocation } from "wouter";
import React, { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, useLogout } from "@/hooks/useAuth";
import type { BlogPost, Event } from "@shared/mongoSchema";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import EventCard from "@/components/EventCard";
import StaffProfileCard from "@/components/StaffProfileCard";
import StudentDashboard from "@/components/StudentDashboard";
import RegistrationForm from "@/components/RegistrationForm";
import LoginForm from "@/components/LoginForm";
import ContactForm from "@/components/ContactForm";
import AdminDashboard from "@/components/AdminDashboard";
import LearningResourceCard from "@/components/LearningResourceCard";
import AboutSection from "@/components/AboutSection";
import CommentsSection from "@/components/CommentsSection";
import ThemeToggle from "@/components/ThemeToggle";
import ModernDashboard from "@/components/ModernDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainDashboardView, {
  UserManagementView,
  StudentGamificationView,
  AnalyticsView,
  BlogManagementView,
  EventManagementView,
  ResourceManagementView,
  SettingsView
} from "@/components/MainDashboardView";

// Pages
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import EventsPage from "@/pages/EventsPage";

// Main Pages
function LandingPage() {
  const { data: blogs, isLoading: blogsLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blogs', { limit: 3 }],
    queryFn: async () => {
      const response = await fetch('/api/blogs?limit=3');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    },
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { limit: 3 }],
    queryFn: async () => {
      const response = await fetch('/api/events?limit=3');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleLearnMore = () => {
    // Scroll to about section
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Recent Blogs */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest from Our Community</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover insights, research, and perspectives from our faculty and students
            </p>
          </div>
          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-muted animate-pulse rounded-lg" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : blogs && blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {blogs.slice(0, 3).map((blog: any) => {
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
                    comments: 0,
                    views: blog.views,
                    image: blog.imageUrl,
                    images: blog.imageUrls,
                    tags: blog.tags,
                  };
                  return <BlogCard key={blog._id} blog={transformedBlog} />;
                })}
              </div>
              <div className="text-center mt-8">
                <a 
                  href="/blogs" 
                  className="inline-flex items-center px-6 py-3 text-primary hover:text-primary/80 transition-colors"
                  data-testid="link-view-all-blogs"
                >
                  View All Blog Posts →
                </a>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No blog posts available yet.</p>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for workshops, seminars, and community gatherings
            </p>
          </div>
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-muted animate-pulse rounded-lg" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.slice(0, 3).map((event: any) => {
                  const transformedEvent = {
                    id: event._id || '',
                    title: event.title,
                    description: event.description,
                    date: new Date(event.date).toISOString().split('T')[0],
                    time: event.time,
                    location: event.location,
                    type: event.type,
                    capacity: event.capacity,
                    registered: 0,
                    price: event.price / 100,
                    image: event.imageUrl,
                    organizer: event.organizerName || 'Unknown Organizer',
                    tags: event.tags,
                  };
                  return <EventCard key={event._id} event={transformedEvent} />;
                })}
              </div>
              <div className="text-center mt-8">
                <a 
                  href="/events" 
                  className="inline-flex items-center px-6 py-3 text-primary hover:text-primary/80 transition-colors"
                  data-testid="link-view-all-events"
                >
                  View All Events →
                </a>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No upcoming events at the moment.</p>
          )}
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-primary/5 rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Register today and become part of a vibrant academic community dedicated to social science excellence.
            </p>
            <button 
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-get-started"
            >
              Get Started Today
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StaffPage() {
  // todo: remove mock functionality
  const mockStaff = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      title: "Professor of Social Psychology",
      department: "Department of Sociology",
      specializations: ["Social Psychology", "Behavioral Research", "Community Studies"],
      email: "s.johnson@university.edu",
      phone: "+1 (555) 123-4567",
      office: "Room 305, Sociology Building",
      bio: "Dr. Johnson is a renowned expert in social psychology with over 15 years of experience.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-prof",
      courses: ["Introduction to Social Psychology", "Research Methods"],
      publications: 47,
      experience: "15+ Years",
      education: ["Ph.D. in Social Psychology, Harvard University"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Faculty</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Meet our dedicated faculty members who are experts in their fields
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockStaff.map((staff) => (
          <StaffProfileCard key={staff.id} staff={staff} />
        ))}
      </div>
    </div>
  );
}

function ResourcesPage() {
  // todo: remove mock functionality
  const mockResources = [
    {
      id: "1",
      title: "Advanced Statistical Methods for Social Research",
      description: "Comprehensive guide covering advanced statistical techniques.",
      type: 'pdf' as const,
      category: "Research Methods",
      size: "12.5 MB",
      downloads: 234,
      rating: 4.7,
      uploadedBy: "Dr. Sarah Johnson",
      uploadDate: "2024-01-15",
      tags: ["statistics", "research", "SPSS"],
      difficulty: 'advanced' as const,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      previewAvailable: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Learning Resources</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access our comprehensive collection of educational materials
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockResources.map((resource) => (
          <LearningResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

function DashboardPage() {
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
    }
  ];

  const mockUpcomingEvents = [
    {
      id: "1",
      title: "Social Innovation Summit 2024",
      date: "Feb 20",
      time: "9:00 AM"
    }
  ];

  const mockRecommendedBlogs = [
    {
      id: "1",
      title: "Advanced Statistical Methods for Social Research",
      author: "Dr. Sarah Johnson",
      readTime: 12
    }
  ];

  const mockBadges = [
    {
      id: "1",
      name: "First Blog",
      icon: "📝",
      description: "Published your first blog post",
      earned: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
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

function RegisterPage() {
  const handleSubmit = (data: any) => {
    // Registration will be handled by RegistrationForm component
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center">
      <RegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

function LoginPage() {
  const handleLogin = (credentials: any) => {
    // Login will be handled by LoginForm component
  };

  const handleSignUpRedirect = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center">
      <LoginForm onLogin={handleLogin} onSignUpRedirect={handleSignUpRedirect} />
    </div>
  );
}

function AdminPage() {
  return <AdminDashboard />;
}

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <AboutSection />
    </div>
  );
}

function ContactPage() {
  const handleSubmit = (data: any) => {
    // Contact form submission will be handled by ContactForm component
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">
          Get in touch with the Department of Sociology
        </p>
      </div>
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
}

// Auth pages that should render without header/footer
function AuthRouter() {
  return (
    <Switch>
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
    </Switch>
  );
}

// Dashboard router for authenticated dashboard pages (Admin and Super Admin only)
function DashboardRouter() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']} redirectTo="/">
      <ModernDashboard>
        <Switch>
          <Route path="/dashboard" component={MainDashboardView} />
          <Route path="/dashboard/users" component={UserManagementView} />
          <Route path="/dashboard/blogs" component={BlogManagementView} />
          <Route path="/dashboard/events" component={EventManagementView} />
          <Route path="/dashboard/resources" component={ResourceManagementView} />
          <Route path="/dashboard/analytics" component={AnalyticsView} />
          <Route path="/dashboard/settings" component={SettingsView} />
          <Route component={MainDashboardView} />
        </Switch>
      </ModernDashboard>
    </ProtectedRoute>
  );
}

// Main app router for authenticated and public pages with layout
function MainRouter() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Switch>
      {isLoading ? (
        <Route component={() => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
          </div>
        )} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/blogs/:id" component={BlogDetailPage} />
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          {/* Redirect to login if trying to access dashboard while not authenticated */}
          <Route path="/dashboard/:rest*">
            {(params) => <RedirectToLogin />}
          </Route>
        </>
      ) : (
        <>
          {/* Dashboard routes - all authenticated users can access */}
          <Route path="/dashboard" component={DashboardRouter} />
          <Route path="/dashboard/:rest*">
            {(params) => <DashboardRouter />}
          </Route>
          
          {/* Landing page accessible to authenticated users */}
          <Route path="/" component={LandingPage} />
          
          {/* Public pages with regular layout for authenticated users */}
          <Route path="/blogs/:id" component={BlogDetailPage} />
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
        </>
      )}
    </Switch>
  );
}

// Separate component for dashboard redirect
function DashboardRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation('/dashboard');
  }, [setLocation]);
  
  return null;
}

// Redirect to login component
function RedirectToLogin() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation('/login');
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Redirecting to login...</h2>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Check if current path is an auth page
  const isAuthPage = location === '/login' || location === '/register';
  
  if (isAuthPage) {
    return <AuthRouter />;
  }
  
  return <MainRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Logout - call the logout mutation
      logoutMutation.mutate();
    } else {
      // Login - redirect to login page
      setLocation('/login');
    }
  };

  const handleNewsletterSignup = (email: string) => {
    alert(`Thank you for subscribing with email: ${email}`);
  };

  // Check if current path is an auth page
  const isAuthPage = location === '/login' || location === '/register';
  
  // Check if current path is a dashboard page (should not have header/footer)
  // Don't show header/footer while loading auth or when on dashboard
  const isDashboardPage = (isLoading && location.startsWith('/dashboard')) || (isAuthenticated && location.startsWith('/dashboard'));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Only render Header for non-auth and non-dashboard pages */}
        {!isAuthPage && !isDashboardPage && (
          <Header user={isAuthenticated && user ? {
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User',
            avatar: user.profileImageUrl || undefined,
            role: (user.role as 'student' | 'admin' | 'guest') || 'student'
          } : undefined} onAuthAction={handleAuthAction} />
        )}
        
        <main className={isDashboardPage ? "flex-1" : "flex-1"}>
          <Router />
        </main>
        
        {/* Only render Footer for non-auth and non-dashboard pages */}
        {!isAuthPage && !isDashboardPage && (
          <Footer onNewsletterSignup={handleNewsletterSignup} />
        )}
        
        {/* Theme Toggle - Fixed Position (only for non-dashboard pages) */}
        {!isDashboardPage && (
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;