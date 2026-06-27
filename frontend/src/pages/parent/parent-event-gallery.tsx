import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function ParentEventGallery() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Cultural Night 2026",
      date: "Jun 15, 2026",
      location: "Main Auditorium",
      image: "https://images.unsplash.com/photo-1586765429758-ec88f3425101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwY3VsdHVyYWwlMjBldmVudCUyMHN0YWdlJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzgxOTQxMzA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Annual cultural fest featuring dance, music, and drama performances by students.",
      guestName: "Dr. Priya Sharma",
      guestDesignation: "Chief Guest",
      photos: 45,
      videos: 8,
    },
    {
      id: 2,
      title: "Sports Day Championship",
      date: "Jun 5, 2026",
      location: "Sports Complex",
      image: "https://images.unsplash.com/photo-1663162550974-aaf76bcdeedf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncm91cCUyMGV2ZW50fGVufDF8fHx8MTc4MTk0MTMwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Inter-hostel sports competition with cricket, football, and athletics events.",
      guestName: "Mr. Rajesh Kumar",
      guestDesignation: "Sports Director",
      photos: 32,
      videos: 5,
    },
    {
      id: 3,
      title: "Tech Fest Innovation",
      date: "May 20, 2026",
      location: "Engineering Block",
      image: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdGVjaCUyMGZlc3QlMjByb2JvdGljc3xlbnwxfHx8fDE3ODE5NDEzMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Technology showcase featuring robotics, AI projects, and coding competitions.",
      guestName: "Dr. Amit Verma",
      guestDesignation: "Tech Entrepreneur",
      photos: 28,
      videos: 12,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Event Gallery</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          <div className="px-6 py-6">
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-card border-border overflow-hidden">
                  {/* Event Image */}
                  <div className="relative h-48 bg-muted">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                        {event.photos} Photos
                      </Badge>
                      <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                        {event.videos} Videos
                      </Badge>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-4">
                    <h3 className="text-base mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="text-muted-foreground" size={16} />
                        <span className="text-muted-foreground">{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="text-muted-foreground" size={16} />
                        <span className="text-muted-foreground">{event.location}</span>
                      </div>
                    </div>

                    {/* Guest Details */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Users className="text-muted-foreground" size={16} />
                        <div>
                          <p className="text-sm">{event.guestName}</p>
                          <p className="text-xs text-muted-foreground">{event.guestDesignation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
