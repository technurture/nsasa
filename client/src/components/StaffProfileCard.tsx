import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, ExternalLink, BookOpen, Award } from "lucide-react";

interface StaffProfileCardProps {
  staff: {
    id: string;
    name: string;
    title: string;
    department: string;
    specializations: string[];
    email: string;
    phone?: string;
    office: string;
    bio: string;
    avatar?: string;
    courses: string[];
    publications: number;
    experience: string;
    education: string[];
  };
  onContact?: (id: string, method: 'email' | 'phone') => void;
  onViewProfile?: (id: string) => void;
}

export default function StaffProfileCard({ staff, onContact, onViewProfile }: StaffProfileCardProps) {
  
  const handleEmailContact = () => {
    onContact?.(staff.id, 'email');
    console.log(`Email contact for: ${staff.name}`);
  };

  const handlePhoneContact = () => {
    onContact?.(staff.id, 'phone');
    console.log(`Phone contact for: ${staff.name}`);
  };

  const handleViewProfile = () => {
    onViewProfile?.(staff.id);
    console.log(`View profile for: ${staff.name}`);
  };

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      <CardHeader className="text-center space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={staff.avatar} alt={staff.name} />
            <AvatarFallback className="text-lg font-semibold">
              {staff.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Title */}
        <div>
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors" data-testid={`text-name-${staff.id}`}>
            {staff.name}
          </h3>
          <p className="text-muted-foreground font-medium" data-testid={`text-title-${staff.id}`}>
            {staff.title}
          </p>
          <p className="text-sm text-muted-foreground">{staff.department}</p>
        </div>

        {/* Experience Badge */}
        <Badge variant="outline" className="mx-auto">
          {staff.experience} Experience
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-bio-${staff.id}`}>
          {staff.bio}
        </p>

        {/* Specializations */}
        <div>
          <h4 className="font-medium text-sm mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-1">
            {staff.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {staff.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{staff.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Courses */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Current Courses
          </h4>
          <div className="space-y-1">
            {staff.courses.slice(0, 2).map((course, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                • {course}
              </p>
            ))}
            {staff.courses.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{staff.courses.length - 2} more courses
              </p>
            )}
          </div>
        </div>

        {/* Publications */}
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium" data-testid={`text-publications-${staff.id}`}>
              {staff.publications}
            </span> Publications
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate" data-testid={`text-email-${staff.id}`}>
              {staff.email}
            </span>
          </div>
          
          {staff.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span data-testid={`text-phone-${staff.id}`}>{staff.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-office-${staff.id}`}>{staff.office}</span>
          </div>
        </div>

        {/* Education */}
        <div>
          <h4 className="font-medium text-sm mb-2">Education</h4>
          <div className="space-y-1">
            {staff.education.slice(0, 2).map((edu, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                • {edu}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1"
            onClick={handleEmailContact}
            data-testid={`button-email-${staff.id}`}
          >
            <Mail className="h-3 w-3" />
            Email
          </Button>
          
          {staff.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={handlePhoneContact}
              data-testid={`button-phone-${staff.id}`}
            >
              <Phone className="h-3 w-3" />
              Call
            </Button>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-1"
          onClick={handleViewProfile}
          data-testid={`button-profile-${staff.id}`}
        >
          <ExternalLink className="h-3 w-3" />
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
}