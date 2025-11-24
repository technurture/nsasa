import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Award, 
  GraduationCap,
  ArrowLeft,
  Briefcase
} from "lucide-react";

export default function StaffDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: staff, isLoading, error } = useQuery<any>({
    queryKey: ['/api/staff', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <Skeleton className="h-48 w-48 mx-auto rounded-full" />
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/staff')}
            className="mb-8"
            data-testid="button-back-to-staff"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Staff Member Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The staff member you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => setLocation('/staff')}>
                View All Staff
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const staffName = staff.customName || staff.name || 'Unknown';
  const initials = staffName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const hasContactInfo = staff.email || staff.phone;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/staff')}
          className="mb-8 hover-elevate"
          data-testid="button-back-to-staff"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar - Profile Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <Avatar className="h-48 w-48 border-4 border-primary/20 shadow-xl ring-8 ring-primary/5">
                    {staff.avatar ? (
                      <AvatarImage 
                        src={staff.avatar} 
                        alt={staffName}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name and Title */}
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold" data-testid="text-staff-name">
                    {staffName}
                  </h1>
                  {staff.position && (
                    <Badge className="text-sm font-semibold px-4 py-1" data-testid="text-staff-position">
                      {staff.position}
                    </Badge>
                  )}
                  {staff.title && (
                    <p className="text-muted-foreground font-medium">
                      {staff.title}
                    </p>
                  )}
                  {staff.department && (
                    <p className="text-sm text-muted-foreground">
                      {staff.department}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Contact Information */}
                {hasContactInfo && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Contact Information</h3>
                    {staff.email && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => window.location.href = `mailto:${staff.email}`}
                        data-testid="button-email"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm truncate">{staff.email}</span>
                      </Button>
                    )}
                    {staff.phone && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => window.location.href = `tel:${staff.phone}`}
                        data-testid="button-phone"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{staff.phone}</span>
                      </Button>
                    )}
                    {staff.office && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{staff.office}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Biography */}
            {staff.bio && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">About</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {staff.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {staff.specializations && staff.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Specializations
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {staff.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Courses */}
            {staff.courses && staff.courses.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Current Courses
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {staff.courses.map((course: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{course}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {staff.education && staff.education.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {staff.education.map((edu: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Experience & Publications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff.experience && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Experience
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{staff.experience}</p>
                  </CardContent>
                </Card>
              )}

              {staff.publications !== undefined && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Publications
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{staff.publications}</p>
                    <p className="text-sm text-muted-foreground">Published papers</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
