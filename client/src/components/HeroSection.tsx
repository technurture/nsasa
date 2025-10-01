import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, BookOpen, Trophy } from "lucide-react";
import backgroundUrl from "@assets/WhatsApp Image 2025-09-24 at 15.45.38_1758874302022.jpeg";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export default function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const stats = [
    { icon: Users, label: "Active Students", value: "500+" },
    { icon: BookOpen, label: "Blog Posts", value: "1,200+" },
    { icon: Trophy, label: "Achievement Badges", value: "2,800+" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Department of Sociology Portal
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
              Nsasa
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Connect, learn, and grow with fellow students in our comprehensive platform designed 
            for academic excellence and community engagement.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="gap-2 bg-primary/90 hover:bg-primary backdrop-blur-sm"
              onClick={onGetStarted}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={onLearnMore}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                  data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="h-6 w-6 text-blue-300" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto fill-background">
          <path d="M0,96L48,106.7C96,117,192,139,288,144C384,149,480,139,576,128C672,117,768,107,864,106.7C960,107,1056,117,1152,117.3C1248,117,1344,107,1392,101.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
}