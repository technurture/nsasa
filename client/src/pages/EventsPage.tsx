import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventCard from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";
import type { Event } from "@shared/mongoSchema";

export default function EventsPage() {
  const [, setLocation] = useLocation();
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

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
              registered: 0, // TODO: Get actual registration count
              price: event.price / 100, // Convert cents to dollars
              image: event.imageUrl,
              organizer: event.organizerId, // TODO: Fetch organizer name
              tags: event.tags,
            };

            return (
              <EventCard 
                key={event._id} 
                event={transformedEvent}
                onRegister={(id) => console.log('Register for event:', id)}
                onShare={(id) => console.log('Share event:', id)}
                onViewDetails={(id) => setLocation(`/events/${id}`)}
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
