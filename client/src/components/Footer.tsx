import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import logoUrl from "@assets/WhatsApp Image 2025-09-24 at 15.46.00_1759342497956.jpeg";

interface FooterProps {
  onNewsletterSignup?: (email: string) => void;
}

export default function Footer({ onNewsletterSignup }: FooterProps) {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    onNewsletterSignup?.(email);
    setEmail("");
    console.log("Newsletter signup:", email);
  };

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
    { label: "Events", href: "/events" },
    { label: "Staff", href: "/staff" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ];

  const quickLinks = [
    { label: "Student Portal", href: "/dashboard" },
    { label: "Registration", href: "/register" },
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Nsasa Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-primary">Nsasa</span>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier student-focused blog and media-sharing platform for the Department of Sociology. 
              Connecting students, fostering learning, and building communities.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    data-testid={`social-${social.label.toLowerCase()}`}
                  >
                    <a href={social.href} aria-label={social.label}>
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            <nav className="space-y-2">
              {navigationLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
                    data-testid={`footer-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
                    data-testid={`footer-quick-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest news and updates from the department.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9"
                  data-testid="input-newsletter-email"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="w-full"
                  disabled={!email.trim()}
                  data-testid="button-newsletter-signup"
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Info</h3>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Sociology Building, University Campus</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@nsasa.edu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 Nsasa - Department of Sociology. All rights reserved. {" "}
            <span className="inline-flex items-center">
              Powered by {" "}
              <a 
                href="https://www.technurture.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline font-medium"
              >
                Technurture
              </a>
            </span>
          </div>
          
          <div className="flex gap-4 text-sm">
            <Link href="/privacy">
              <Button variant="ghost" className="p-0 h-auto text-xs underline" data-testid="link-privacy">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost" className="p-0 h-auto text-xs underline" data-testid="link-terms">
                Terms of Service
              </Button>
            </Link>
            <Link href="/accessibility">
              <Button variant="ghost" className="p-0 h-auto text-xs underline" data-testid="link-accessibility">
                Accessibility
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}