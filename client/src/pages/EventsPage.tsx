import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventCard from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";
import type { Event } from "@shared/mongoSchema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function EventsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Fetch user's event registrations if authenticated
  const { data: userRegistrations } = useQuery<any[]>({
    queryKey: ['/api/user/event-registrations'],
    enabled: isAuthenticated,
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await apiRequest('POST', `/api/events/${eventId}/register`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Registration Successful",
        description: "You have been registered for this event",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please log in to register for events",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }
    registerMutation.mutate(eventId);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold" data-testid="heading-events">Events</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join us for workshops, seminars, and community gatherings
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            // Transform event data to match EventCard props
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
              price: event.price,
              image: event.imageUrl,
              organizer: (event as any).organizerName || event.organizerId,
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
                onRegister={handleRegister}
                onReadMore={(id) => setLocation(`/events/${id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-no-events">
            No events available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
