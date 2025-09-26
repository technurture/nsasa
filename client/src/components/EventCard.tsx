import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { useState } from "react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'workshop' | 'seminar' | 'conference' | 'social' | 'academic';
    capacity: number;
    registered: number;
    price?: number;
    image?: string;
    organizer: string;
    tags: string[];
  };
  onRegister?: (id: string) => void;
  onShare?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function EventCard({ event, onRegister, onShare, onViewDetails }: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
    onRegister?.(event.id);
    console.log(`Registered for event: ${event.title}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      seminar: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      conference: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      academic: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const spotsLeft = event.capacity - event.registered;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      {/* Event Image */}
      {event.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardHeader className="space-y-4">
        {/* Type and Price */}
        <div className="flex items-center justify-between">
          <Badge className={getTypeColor(event.type)} data-testid={`badge-type-${event.id}`}>
            {event.type}
          </Badge>
          {event.price && (
            <Badge variant="outline" className="text-green-600">
              ${event.price}
            </Badge>
          )}
          {!event.price && (
            <Badge variant="outline" className="text-green-600">
              Free
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground line-clamp-2" data-testid={`text-description-${event.id}`}>
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-date-${event.id}`}>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-time-${event.id}`}>{event.time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-location-${event.id}`}>{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-capacity-${event.id}`}>
              {event.registered}/{event.capacity} registered
            </span>
            {isAlmostFull && (
              <Badge variant="outline" className="text-orange-600 text-xs">
                Almost Full
              </Badge>
            )}
            {isFull && (
              <Badge variant="outline" className="text-red-600 text-xs">
                Full
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Organizer */}
        <p className="text-sm text-muted-foreground">
          Organized by <span className="font-medium">{event.organizer}</span>
        </p>
      </CardHeader>

      <CardFooter className="flex items-center justify-between pt-0">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-1">
          {!isRegistered && !isFull && (
            <Button 
              onClick={handleRegister}
              className="flex-1"
              data-testid={`button-register-${event.id}`}
            >
              Register
            </Button>
          )}
          
          {isRegistered && (
            <Button 
              variant="outline" 
              className="flex-1"
              disabled
              data-testid={`button-registered-${event.id}`}
            >
              ✓ Registered
            </Button>
          )}
          
          {isFull && !isRegistered && (
            <Button 
              variant="outline" 
              className="flex-1"
              disabled
              data-testid={`button-full-${event.id}`}
            >
              Event Full
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onShare?.(event.id)}
            data-testid={`button-share-${event.id}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onViewDetails?.(event.id)}
            data-testid={`button-details-${event.id}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}