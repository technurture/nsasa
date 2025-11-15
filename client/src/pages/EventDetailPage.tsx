import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, X, ChevronLeft, ChevronRight, Share2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Event } from "@shared/mongoSchema";

export default function EventDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const eventId = params.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery<any>({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId
  });

  useEffect(() => {
    if (event) {
      setIsRegistered(event.isRegistered || false);
      setRegisteredCount(event.registeredCount || 0);
    }
  }, [event]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/events/${eventId}/register`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsRegistered(true);
      setRegisteredCount(data.registeredCount || registeredCount + 1);
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: "Registration Successful",
        description: "You have been registered for this event",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register for the event",
        variant: "destructive",
      });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/events/${eventId}/register`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsRegistered(false);
      setRegisteredCount(data.registeredCount || registeredCount - 1);
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been cancelled",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel registration",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to register for events",
        variant: "destructive",
      });
      return;
    }

    if (isRegistered) {
      unregisterMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load event. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Event not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
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

  const displayImage = event.imageUrl || (event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : undefined);
  
  const galleryImages = event.imageUrl 
    ? (event.imageUrls || [])
    : (event.imageUrls && event.imageUrls.length > 1 ? event.imageUrls.slice(1) : []);
  
  const allImages = [displayImage, ...galleryImages].filter(Boolean);
  
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };
  
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageIndex(null);
  };
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
    } else {
      setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
    }
  };

  const spotsLeft = event.capacity - registeredCount;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/events')}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Details */}
        <article>
          {/* Featured Image */}
          {displayImage && (
            <div 
              className="aspect-video w-full overflow-hidden rounded-md mb-8 cursor-pointer hover-elevate"
              onClick={() => openImageModal(0)}
              data-testid="img-featured-container"
            >
              <img 
                src={displayImage} 
                alt={event.title}
                className="w-full h-full object-cover"
                data-testid="img-featured"
              />
            </div>
          )}

          {/* Type and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={getTypeColor(event.type)} data-testid="badge-type">
              {event.type}
            </Badge>
            {event.tags && event.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6" data-testid="heading-title">
            {event.title}
          </h1>

          {/* Key Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
            {/* Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium" data-testid="text-date">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium" data-testid="text-time">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium" data-testid="text-location">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Capacity & Price */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium" data-testid="text-capacity">
                    {registeredCount}/{event.capacity} registered
                  </p>
                  {isAlmostFull && (
                    <Badge variant="outline" className="text-orange-600 text-xs mt-1">
                      Almost Full
                    </Badge>
                  )}
                  {isFull && (
                    <Badge variant="outline" className="text-red-600 text-xs mt-1">
                      Event Full
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium" data-testid="text-price">
                    {event.price > 0 ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                  <p className="font-medium" data-testid="text-organizer">
                    {event.organizerName || 'Unknown Organizer'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              data-testid="content-description"
            >
              {event.description}
            </div>
          </div>

          {/* Additional Images Gallery - Swipeable Carousel */}
          {galleryImages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Gallery</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <Card 
                        className="overflow-hidden hover-elevate transition-all cursor-pointer border-0"
                        onClick={() => openImageModal(index + 1)}
                        data-testid={`img-gallery-slide-${index}`}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={imageUrl} 
                            alt={`${event.title} - Image ${index + 2}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious 
                  className="hidden sm:flex -left-12" 
                  data-testid="button-gallery-prev"
                />
                <CarouselNext 
                  className="hidden sm:flex -right-12" 
                  data-testid="button-gallery-next"
                />
              </Carousel>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Swipe or use arrows to view more images • Click any image to view full size
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 py-8 border-t border-b">
            {!isRegistered && !isFull && (
              <Button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="flex-1"
                data-testid="button-register"
              >
                {registerMutation.isPending ? 'Registering...' : 'Register for Event'}
              </Button>
            )}

            {isRegistered && (
              <Button
                variant="outline"
                onClick={handleRegister}
                disabled={unregisterMutation.isPending}
                className="flex-1"
                data-testid="button-unregister"
              >
                {unregisterMutation.isPending ? 'Cancelling...' : '✓ Registered - Click to Cancel'}
              </Button>
            )}

            {isFull && !isRegistered && (
              <Button
                variant="outline"
                disabled
                className="flex-1"
                data-testid="button-full"
              >
                Event Full
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              data-testid="button-share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </article>
      </div>
      
      {/* Full Screen Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeImageModal}
              data-testid="button-modal-close"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Counter */}
            {selectedImageIndex !== null && allImages.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white px-4 py-2 rounded-md text-sm">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Previous Button */}
            {selectedImageIndex !== null && allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={() => navigateImage('prev')}
                data-testid="button-modal-prev"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            {selectedImageIndex !== null && allImages[selectedImageIndex] && (
              <img
                src={allImages[selectedImageIndex]}
                alt={`${event.title} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                data-testid="img-modal"
              />
            )}

            {/* Next Button */}
            {selectedImageIndex !== null && allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={() => navigateImage('next')}
                data-testid="button-modal-next"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
