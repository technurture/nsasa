import { Switch, Route, useLocation } from "wouter";
import React, { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
import ResourceDetailModal from "@/components/ResourceDetailModal";
import FilePreviewModal from "@/components/FilePreviewModal";
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
  StaffManagementView,
  SettingsView
} from "@/components/MainDashboardView";

// Pages
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import StaffPage from "@/pages/StaffPage";
import StaffDetailPage from "@/pages/StaffDetailPage";
import LearningResourceDetailPage from "@/pages/LearningResourceDetailPage";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

// Featured Staff Section Component with Card Design and Translation Support
function FeaturedStaffSection() {
  const [, setLocation] = useLocation();
  const { data: featuredStaff, isLoading } = useQuery<any[]>({
    queryKey: ['/api/staff/landing-page/featured'],
    queryFn: async () => {
      const response = await fetch('/api/staff/landing-page/featured');
      if (!response.ok) throw new Error('Failed to fetch featured staff');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Leadership</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated team leading our department
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden hover-elevate">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="h-48 w-48 mx-auto bg-muted animate-pulse rounded-full" />
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!featuredStaff || featuredStaff.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4" data-testid="heading-our-leadership">Our Leadership</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Meet the dedicated team leading our department
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {featuredStaff.map((staff) => {
          const staffName = staff.customName || staff.name || 'Unknown';
          const initials = staffName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
          
          return (
            <Card 
              key={staff._id} 
              className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:shadow-xl"
              data-testid={`staff-card-${staff._id}`}
              onClick={() => setLocation(`/staff/${staff._id}`)}
            >
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center relative">
                  <div className="relative">
                    <Avatar className="h-48 w-48 border-4 border-primary/20 shadow-2xl group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300 ring-8 ring-primary/5">
                      {staff.avatar ? (
                        <AvatarImage 
                          src={staff.avatar} 
                          alt={staffName}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full p-3 shadow-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-2xl group-hover:text-primary transition-colors duration-300" data-testid={`text-name-${staff._id}`}>
                    {staffName}
                  </h3>
                  {staff.position && (
                    <Badge className="text-sm font-semibold px-4 py-1" data-testid={`text-position-${staff._id}`}>
                      {staff.position}
                    </Badge>
                  )}
                  {staff.title && (
                    <p className="text-base text-muted-foreground line-clamp-2 mt-2">
                      {staff.title}
                    </p>
                  )}
                </div>
                
                {staff.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                    {staff.bio}
                  </p>
                )}
                
                <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-primary font-semibold">Click to view full profile →</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="text-center mt-10">
        <Button 
          variant="outline"
          onClick={() => setLocation('/staff')}
          data-testid="link-view-all-staff"
          className="group"
        >
          View All Staff
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </section>
  );
}

// Main Pages
function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
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

  // Fetch user's event registrations if authenticated
  const { data: userRegistrations } = useQuery<any[]>({
    queryKey: ['/api/user/event-registrations'],
    enabled: isAuthenticated,
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
                    imageUrl: blog.imageUrl,
                    imageUrls: blog.imageUrls,
                    tags: blog.tags,
                  };
                  return (
                    <BlogCard 
                      key={blog._id} 
                      blog={transformedBlog}
                      isLikedByUser={blog.isLikedByUser || false}
                      onReadMore={(id) => setLocation(`/blogs/${id}`)}
                      onComment={(id) => setLocation(`/blogs/${id}#comments`)}
                    />
                  );
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
                    registered: (event as any).registrationCount || 0,
                    price: event.price / 100,
                    image: event.imageUrl,
                    organizer: event.organizerName || 'Unknown Organizer',
                    tags: event.tags,
                  };
                  
                  // Check if user is registered for this event
                  const isUserRegistered = userRegistrations?.some(
                    (reg) => reg.eventId === event._id
                  ) || false;
                  
                  return (
                    <EventCard 
                      key={event._id} 
                      event={transformedEvent}
                      isRegistered={isUserRegistered}
                      onReadMore={(id) => setLocation(`/events/${id}`)}
                    />
                  );
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

        {/* Featured Staff - Moved after Upcoming Events */}
        <FeaturedStaffSection />

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

function ResourcesPage() {
  const [, setLocation] = useLocation();
  const [selectedResource, setSelectedResource] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [previewResource, setPreviewResource] = React.useState<any>(null);

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      const response = await fetch('/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
  });

  const handleReadMore = (id: string) => {
    const resource = resources?.find((r: any) => r._id === id);
    if (resource) {
      const transformedResource = {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        size: resource.fileSize || 'Unknown',
        downloads: resource.downloads || 0,
        rating: resource.rating || 0,
        uploadedBy: resource.uploaderName || 'Unknown',
        uploadDate: new Date(resource.uploadedAt || resource.createdAt).toISOString().split('T')[0],
        tags: resource.tags || [],
        difficulty: resource.difficulty,
        thumbnail: resource.thumbnailUrl,
        previewAvailable: !!resource.previewUrl,
        fileUrl: resource.fileUrl,
        fileName: resource.fileName
      };
      setSelectedResource(transformedResource);
      setIsModalOpen(true);
    }
  };

  const handleCardClick = (id: string) => {
    setLocation(`/resources/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Learning Resources</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access our comprehensive collection of educational materials
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load resources. Please try again later.</p>
        </div>
      ) : resources && resources.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource: any) => {
              const transformedResource = {
                id: resource._id,
                title: resource.title,
                description: resource.description,
                type: resource.type,
                category: resource.category,
                size: resource.fileSize || 'Unknown',
                downloads: resource.downloads || 0,
                rating: resource.rating || 0,
                uploadedBy: resource.uploaderName || 'Unknown',
                uploadDate: new Date(resource.uploadedAt || resource.createdAt).toISOString().split('T')[0],
                tags: resource.tags || [],
                difficulty: resource.difficulty,
                thumbnail: resource.thumbnailUrl,
                previewAvailable: !!resource.previewUrl,
                fileUrl: resource.fileUrl,
                fileName: resource.fileName
              };
              
              return (
                <div 
                  key={resource._id} 
                  onClick={() => handleCardClick(resource._id)}
                  className="cursor-pointer"
                  data-testid={`card-resource-${resource._id}`}
                >
                  <LearningResourceCard 
                    resource={transformedResource}
                    onReadMore={handleReadMore}
                  />
                </div>
              );
            })}
          </div>

          <ResourceDetailModal
            open={isModalOpen && !!selectedResource}
            onOpenChange={setIsModalOpen}
            resource={selectedResource || {
              id: '',
              title: '',
              description: '',
              type: 'document' as const,
              category: '',
              size: '',
              downloads: 0,
              rating: 0,
              uploadedBy: '',
              uploadDate: '',
              tags: [],
              difficulty: '100l' as const,
              previewAvailable: false,
              fileUrl: '',
              fileName: ''
            }}
            onDownload={async (id) => {
              try {
                await fetch(`/api/resources/${id}/download`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                });
              } catch (error) {
                console.error('Error recording download:', error);
              }
            }}
            onPreview={(id) => {
              const resourceToPreview = resources.find((r: any) => r._id === id);
              if (resourceToPreview) {
                setPreviewResource(resourceToPreview);
              }
            }}
          />

          {previewResource && (
            <FilePreviewModal
              open={!!previewResource}
              onOpenChange={(open) => !open && setPreviewResource(null)}
              fileUrl={previewResource.fileUrl}
              fileName={previewResource.fileName || previewResource.title}
              fileType={previewResource.type}
              title={previewResource.title}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No learning resources available yet.</p>
        </div>
      )}
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
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
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
          <Route path="/dashboard/staff" component={StaffManagementView} />
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
          <Route path="/events/:id" component={EventDetailPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/resources/:id" component={LearningResourceDetailPage} />
          <Route path="/staff/:id" component={StaffDetailPage} />
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
          <Route path="/events/:id" component={EventDetailPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/resources/:id" component={LearningResourceDetailPage} />
          <Route path="/staff/:id" component={StaffDetailPage} />
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
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
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
  const isAuthPage = location === '/login' || location === '/register' || location === '/forgot-password' || location === '/reset-password';
  
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