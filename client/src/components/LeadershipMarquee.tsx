import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface LeadershipMarqueeProps {
    staffs: any[];
}

export default function LeadershipMarquee({ staffs }: LeadershipMarqueeProps) {
    // We duplicate the list to ensure smooth infinite scrolling
    const allStaffs = [...staffs, ...staffs];

    return (
        <div className="w-full relative overflow-hidden group">
            {/* Gradient Masks for fading effect at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
                {allStaffs.map((staff, index) => {
                    const staffName = staff.customName || staff.name || 'Unknown';
                    const initials = staffName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

                    return (
                        <div
                            key={`${staff._id}-${index}`}
                            className="mx-4 w-[300px] md:w-[350px] shrink-0 transform transition-transform duration-300 hover:scale-105"
                        >
                            <Link href={`/staff/${staff._id}`}>
                                <Card className="h-full overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer">
                                    <CardContent className="p-6 text-center space-y-4">
                                        <div className="flex justify-center relative">
                                            <Avatar className="h-32 w-32 border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-300">
                                                {staff.avatar ? (
                                                    <AvatarImage src={staff.avatar} alt={staffName} className="object-cover" />
                                                ) : null}
                                                <AvatarFallback className="text-xl font-bold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
                                                {staffName}
                                            </h3>

                                            {staff.position && (
                                                <Badge variant="secondary" className="mb-2">
                                                    {staff.position}
                                                </Badge>
                                            )}

                                            <p className="text-sm text-muted-foreground line-clamp-3 italic">
                                                "{staff.bio || 'Dedicated team member committed to excellence.'}"
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
