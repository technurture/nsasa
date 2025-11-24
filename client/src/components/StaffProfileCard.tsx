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
  
  const handleEmailContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(staff.id, 'email');
    console.log(`Email contact for: ${staff.name}`);
  };

  const handlePhoneContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(staff.id, 'phone');
    console.log(`Phone contact for: ${staff.name}`);
  };

  const handleViewProfile = () => {
    onViewProfile?.(staff.id);
    console.log(`View profile for: ${staff.name}`);
  };

  const handleViewFullProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile?.(staff.id);
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate transition-all duration-200 cursor-pointer" 
      onClick={handleViewProfile}
      data-testid={`card-staff-${staff.id}`}
    >
      <CardHeader className="text-center space-y-3 pb-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <Avatar className="!h-40 !w-40 border-4 border-background shadow-lg">
            <AvatarImage src={staff.avatar} alt={staff.name} />
            <AvatarFallback className="text-3xl font-semibold">
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
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Bio - Shortened */}
        {staff.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 text-center" data-testid={`text-bio-${staff.id}`}>
            {staff.bio}
          </p>
        )}

        {/* Specializations - Limited to 2 */}
        {staff.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {staff.specializations.slice(0, 2).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {staff.specializations.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{staff.specializations.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
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
          variant="default" 
          size="sm" 
          className="w-full gap-1"
          onClick={handleViewFullProfile}
          data-testid={`button-profile-${staff.id}`}
        >
          <ExternalLink className="h-3 w-3" />
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
}