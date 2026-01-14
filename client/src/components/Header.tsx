import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, User, Settings, LogOut, Home, BookOpen, Calendar, Users, FileText, Phone, Info, LayoutDashboard, ChevronDown, Compass } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import logoUrl from "@assets/WhatsApp Image 2025-09-24 at 15.46.00_1759342497956.jpeg";

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
    role: 'student' | 'admin' | 'guest';
  };
  onAuthAction?: () => void;
}

export default function Header({ user, onAuthAction }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Primary navigation items (always visible)
  const primaryNav = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  // Discover dropdown items
  const discoverItems = [
    { path: "/blogs", label: "Blogs", icon: BookOpen, description: "Read articles and insights" },
    { path: "/events", label: "Events", icon: Calendar, description: "Join our community events" },
    { path: "/resources", label: "Resources", icon: FileText, description: "Access learning materials" },
    { path: "/staff", label: "Staff", icon: Users, description: "Meet our faculty" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 flex-shrink-0">
            <img src={logoUrl} alt="Nsasa Logo" className="h-8 w-8 rounded-md" />
            <span className="text-xl font-bold text-primary">Nsasa</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-wrap">
            {/* Primary nav items */}
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  data-testid="nav-discover"
                >
                  <Compass className="h-4 w-4" />
                  Discover
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {discoverItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      data-testid={`dropdown-${item.label.toLowerCase()}`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search blogs, events..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <Button variant="ghost" size="icon" data-testid="button-notifications">
                  <Bell className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href="/dashboard">
                      <DropdownMenuItem data-testid="menu-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/settings">
                      <DropdownMenuItem data-testid="menu-profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/settings">
                      <DropdownMenuItem data-testid="menu-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onAuthAction} data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" data-testid="button-register">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-2 px-2">
                    <img src={logoUrl} alt="Nsasa" className="h-6 w-6 rounded-md" />
                    <span className="text-lg font-bold">Nsasa</span>
                  </div>

                  {/* Mobile Auth Buttons - Only show when logged out */}
                  {!user && (
                    <div className="flex flex-col gap-2 px-2">
                      <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start" size="sm" data-testid="mobile-button-login">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button variant="default" className="w-full" size="sm" data-testid="mobile-button-register">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="px-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="mobile-input-search"
                      />
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-1 px-2">
                    {/* Primary nav items */}
                    {primaryNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;

                      return (
                        <Link key={item.path} href={item.path}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                            size="sm"
                            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}

                    {/* Discover section */}
                    <div className="py-2">
                      <div className="flex items-center gap-2 px-3 py-1">
                        <Compass className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">Discover</span>
                      </div>
                      {discoverItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.path;

                        return (
                          <Link key={item.path} href={item.path}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start gap-2"
                              size="sm"
                              data-testid={`mobile-discover-${item.label.toLowerCase()}`}
                            >
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}