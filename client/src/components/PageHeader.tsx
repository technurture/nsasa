import { Badge } from "@/components/ui/badge";
import backgroundUrl from "@assets/WhatsApp Image 2025-09-24 at 15.45.38_1758874302022.jpeg";

interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: string;
    backgroundImage?: string;
}

export default function PageHeader({
    title,
    description,
    badge = "Department of Sociology Portal",
    backgroundImage = backgroundUrl
}: PageHeaderProps) {
    return (
        <section className="relative overflow-hidden mb-8">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
                <div className="max-w-4xl mx-auto text-center text-white">
                    {/* Badge */}
                    {badge && (
                        <Badge variant="outline" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm whitespace-normal text-center">
                            {badge}
                        </Badge>
                    )}

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight break-words overflow-wrap-anywhere">
                        {title}
                    </h1>

                    {/* Subheading */}
                    {description && (
                        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Wave - Optional, maybe keep it simple for subpages? Let's keep it to match Hero */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" className="w-full h-auto fill-background">
                    <path d="M0,96L48,106.7C96,117,192,139,288,144C384,149,480,139,576,128C672,117,768,107,864,106.7C960,107,1056,117,1152,117.3C1248,117,1344,107,1392,101.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                </svg>
            </div>
        </section>
    );
}
