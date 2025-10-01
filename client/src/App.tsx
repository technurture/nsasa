import { Switch, Route, useLocation } from "wouter";
import React, { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

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
import MainDashboardView, {
  UserManagementView,
  StudentGamificationView,
  AnalyticsView,
  BlogManagementView,
  EventManagementView,
  ResourceManagementView,
  SettingsView
} from "@/components/MainDashboardView";

// Main Pages
function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleLearnMore = () => {
    console.log('Learn More clicked - would scroll to about section');
  };

  // todo: remove mock functionality
  const mockBlogs = [
    {
      id: "1",
      title: "Understanding Social Psychology in Modern Society",
      excerpt: "Explore the fascinating world of social psychology and how it shapes our daily interactions.",
      content: "Full content...",
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
      tags: ["psychology", "society", "behavior"]
    },
    {
      id: "2",
      title: "Research Methods in Sociology",
      excerpt: "A comprehensive guide to quantitative and qualitative research methodologies.",
      content: "Full content...",
      author: {
        name: "Prof. Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        level: "Associate Professor"
      },
      category: "Research",
      publishedAt: "2024-01-12",
      readTime: 12,
      likes: 18,
      comments: 8,
      views: 203,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop",
      tags: ["research", "methodology", "data"]
    }
  ];

  const mockEvents = [
    {
      id: "1",
      title: "Social Innovation Summit 2024",
      description: "Join us for an inspiring day of presentations and networking.",
      date: "2024-02-20",
      time: "9:00 AM - 5:00 PM",
      location: "Main Auditorium",
      type: 'conference' as const,
      capacity: 150,
      registered: 127,
      price: 25,
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=300&fit=crop",
      organizer: "Department of Sociology",
      tags: ["innovation", "research", "networking"]
    }
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mockBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for workshops, seminars, and community gatherings
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
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
            >
              Get Started Today
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function BlogsPage() {
  // todo: remove mock functionality
  const mockBlogs = [
    {
      id: "1",
      title: "Understanding Social Psychology in Modern Society",
      excerpt: "Explore the fascinating world of social psychology and how it shapes our daily interactions.",
      content: "Full content...",
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
      tags: ["psychology", "society", "behavior"]
    },
    {
      id: "2",
      title: "Research Methods in Sociology",
      excerpt: "A comprehensive guide to quantitative and qualitative research methodologies.",
      content: "Full content...",
      author: {
        name: "Prof. Michael Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        level: "Associate Professor"
      },
      category: "Research",
      publishedAt: "2024-01-12",
      readTime: 12,
      likes: 18,
      comments: 8,
      views: 203,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop",
      tags: ["research", "methodology", "data"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of articles, research insights, and academic discussions
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
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
    console.log('Registration submitted:', data);
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
    console.log('Login attempt:', credentials);
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
    console.log('Contact form submitted:', data);
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

// Dashboard router for authenticated dashboard pages
function DashboardRouter() {
  return (
    <ModernDashboard>
      <Switch>
        <Route path="/dashboard" component={MainDashboardView} />
        <Route path="/dashboard/users" component={UserManagementView} />
        <Route path="/dashboard/blogs" component={BlogManagementView} />
        <Route path="/dashboard/events" component={EventManagementView} />
        <Route path="/dashboard/resources" component={ResourceManagementView} />
        <Route path="/dashboard/analytics" component={AnalyticsView} />
        <Route path="/dashboard/gamification" component={StudentGamificationView} />
        <Route path="/dashboard/settings" component={SettingsView} />
        <Route component={MainDashboardView} />
      </Switch>
    </ModernDashboard>
  );
}

// Main app router for authenticated and public pages with layout
function MainRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle redirect to dashboard for authenticated users using useEffect
  useEffect(() => {
    if (isAuthenticated && !isLoading && location === '/') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

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
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
        </>
      ) : (
        <>
          {/* Dashboard routes use ModernDashboard layout */}
          <Route path="/dashboard" component={DashboardRouter} nest />
          
          {/* Public pages with regular layout for authenticated users */}
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/events" component={BlogsPage} />
          
          {/* Default route for authenticated users */}
          <Route path="/" component={DashboardRedirect} />
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
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Logout - call the logout endpoint
      window.location.href = '/api/auth/logout';
    } else {
      // Login - redirect to login page
      window.location.href = '/login';
    }
  };

  const handleNewsletterSignup = (email: string) => {
    console.log('Newsletter signup:', email);
    alert(`Thank you for subscribing with email: ${email}`);
  };

  // Check if current path is an auth page
  const isAuthPage = location === '/login' || location === '/register';
  
  // Check if current path is a dashboard page (should not have header/footer)
  const isDashboardPage = isAuthenticated && location.startsWith('/dashboard');

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