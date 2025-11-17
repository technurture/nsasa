import { useQuery } from "@tanstack/react-query";
import StaffProfileCard from "@/components/StaffProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { z } from "zod";
import { staffProfileSchema, userSchema } from "@shared/mongoSchema";

type StaffProfile = z.infer<typeof staffProfileSchema>;
type User = z.infer<typeof userSchema>;

export default function StaffPage() {
  const { data: staffProfiles = [], isLoading } = useQuery<(StaffProfile & { user?: User })[]>({
    queryKey: ['/api/staff']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Transform API data to match StaffProfileCard props
  const transformedStaff = staffProfiles.map((profile) => ({
    id: profile._id || "",
    name: `${profile.user?.firstName || ""} ${profile.user?.lastName || ""}`.trim(),
    title: profile.title,
    department: profile.department,
    specializations: profile.specializations || [],
    email: profile.user?.email || "",
    phone: profile.user?.phoneNumber,
    office: profile.office || "",
    bio: profile.bio || "",
    avatar: profile.user?.avatar,
    courses: profile.courses || [],
    publications: profile.publications || 0,
    experience: profile.experience || "",
    education: profile.education || []
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-staff-page">
            Our Faculty & Staff
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-staff-description">
            Meet our dedicated team of educators and researchers committed to advancing the field of sociology
          </p>
        </div>

        {/* Staff Grid */}
        {transformedStaff.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-staff">
                No Staff Profiles Yet
              </h3>
              <p className="text-muted-foreground" data-testid="text-no-staff-description">
                Staff profiles will appear here once they are added by administrators.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-staff">
            {transformedStaff.map((staff) => (
              <div key={staff.id} data-testid={`staff-card-${staff.id}`}>
                <StaffProfileCard 
                  staff={staff}
                  onContact={(id, method) => {
                    if (method === 'email') {
                      window.location.href = `mailto:${staff.email}`;
                    } else if (method === 'phone' && staff.phone) {
                      window.location.href = `tel:${staff.phone}`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
