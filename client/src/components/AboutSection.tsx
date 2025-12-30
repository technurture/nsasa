import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  Lightbulb, 
  Heart,
  ArrowRight,
  Calendar,
  TrendingUp
} from "lucide-react";

interface AboutSectionProps {
  onGetInvolved?: () => void;
  onViewPrograms?: () => void;
  onContactUs?: () => void;
}

export default function AboutSection({ onGetInvolved, onViewPrograms, onContactUs }: AboutSectionProps) {
  const stats = [
    { icon: Users, label: "Active Students", value: "500+" },
    { icon: BookOpen, label: "Academic Programs", value: "12" },
    { icon: Award, label: "Faculty Members", value: "35" },
    { icon: Calendar, label: "Years of Excellence", value: "25+" },
  ];

  const values = [
    {
      icon: Target,
      title: "Academic Excellence",
      description: "Committed to providing world-class education and fostering critical thinking in social sciences."
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Building bridges between academic learning and real-world social impact through community partnerships."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Embracing new methodologies and technologies to advance social science research and education."
    },
    {
      icon: Heart,
      title: "Social Responsibility",
      description: "Developing socially conscious leaders who can address contemporary societal challenges."
    }
  ];

  const achievements = [
    "Top-ranked Sociology department in the region",
    "Award-winning research programs in community development",
    "Strong industry partnerships and internship opportunities",
    "Alumni network spanning across government, NGOs, and academia",
    "International collaborations with leading universities"
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 px-4">
        <Badge variant="outline" className="mb-4 whitespace-normal text-center">
          About Our Department
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight break-words">
          Shaping Tomorrow's
          <span className="text-primary block">Social Scientists</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The Department of Sociology has been at the forefront of academic excellence and social research 
          for over two decades, nurturing critical thinkers and change-makers who make a difference in society.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center hover-elevate transition-all duration-200">
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-full inline-flex mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mission Statement */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              To advance knowledge in the social sciences through innovative research, exceptional teaching, 
              and meaningful community engagement. We strive to develop well-rounded graduates who understand 
              the complexities of human society and are equipped with the skills and knowledge to contribute 
              positively to their communities and the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={onViewPrograms} data-testid="button-view-programs">
                <BookOpen className="h-4 w-4 mr-2" />
                View Our Programs
              </Button>
              <Button variant="outline" onClick={onGetInvolved} data-testid="button-get-involved">
                <Users className="h-4 w-4 mr-2" />
                Get Involved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These fundamental principles guide everything we do as a department and shape our approach to education and research.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take pride in our accomplishments and the impact we've made in the field of social sciences 
              and in our community over the years.
            </p>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{achievement}</span>
              </div>
            ))}
          </div>

          <Button onClick={onContactUs} className="mt-6" data-testid="button-contact-us">
            Contact Us
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="relative">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/20 rounded-full inline-flex mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Recognition</h3>
                  <p className="text-muted-foreground">
                    Consistently ranked among the top social science departments nationally
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Graduate Employment Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.8/5</div>
                    <div className="text-sm text-muted-foreground">Student Satisfaction</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-8 lg:p-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Join Our Community</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Whether you're a prospective student, researcher, or community partner, 
              we invite you to be part of our journey in advancing social science education and research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                variant="secondary" 
                onClick={onGetInvolved}
                data-testid="button-join-community"
              >
                <Users className="h-4 w-4 mr-2" />
                Become a Student
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-primary-foreground hover:bg-white/10"
                onClick={onViewPrograms}
                data-testid="button-explore-programs"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Explore Programs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}