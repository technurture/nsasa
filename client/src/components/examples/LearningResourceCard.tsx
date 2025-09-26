import LearningResourceCard from '../LearningResourceCard'

export default function LearningResourceCardExample() {
  // todo: remove mock functionality
  const mockResource = {
    id: "1",
    title: "Advanced Statistical Methods for Social Research",
    description: "Comprehensive guide covering advanced statistical techniques used in social science research, including regression analysis, factor analysis, and structural equation modeling with practical examples using SPSS and R.",
    type: 'pdf' as const,
    category: "Research Methods",
    size: "12.5 MB",
    downloads: 234,
    rating: 4.7,
    uploadedBy: "Dr. Sarah Johnson",
    uploadDate: "2024-01-15",
    tags: ["statistics", "research", "SPSS", "analysis", "methodology"],
    difficulty: 'advanced' as const,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    previewAvailable: true
  };

  const handleDownload = (id: string) => {
    console.log(`Download resource: ${id}`);
  };

  const handlePreview = (id: string) => {
    console.log(`Preview resource: ${id}`);
  };

  const handleRate = (id: string, rating: number) => {
    console.log(`Rate resource ${id}: ${rating} stars`);
  };

  const handleFavorite = (id: string) => {
    console.log(`Favorite resource: ${id}`);
  };

  return (
    <div className="max-w-sm p-4">
      <LearningResourceCard 
        resource={mockResource}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onRate={handleRate}
        onFavorite={handleFavorite}
      />
    </div>
  );
}