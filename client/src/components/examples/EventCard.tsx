import EventCard from '../EventCard'

export default function EventCardExample() {
  // todo: remove mock functionality
  const mockEvent = {
    id: "1",
    title: "Social Innovation Summit 2024",
    description: "Join us for an inspiring day of presentations, workshops, and networking focused on creating positive social change through innovative research and community engagement.",
    date: "2024-02-20",
    time: "9:00 AM - 5:00 PM",
    location: "Main Auditorium, Sociology Building",
    type: 'conference' as const,
    capacity: 150,
    registered: 127,
    price: 25,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=300&fit=crop",
    organizer: "Department of Sociology",
    tags: ["innovation", "research", "networking", "community"]
  };

  const handleRegister = (id: string) => {
    console.log(`Register clicked for event: ${id}`);
  };

  const handleShare = (id: string) => {
    console.log(`Share clicked for event: ${id}`);
  };

  const handleViewDetails = (id: string) => {
    console.log(`View details clicked for event: ${id}`);
  };

  return (
    <div className="max-w-md">
      <EventCard 
        event={mockEvent}
        onRegister={handleRegister}
        onShare={handleShare}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}