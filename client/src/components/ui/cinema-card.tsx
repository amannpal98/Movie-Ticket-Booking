import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';

interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
}

interface CinemaCardProps {
  cinema: Cinema;
  onViewShows?: (cinemaId: number) => void;
}

export default function CinemaCard({ cinema, onViewShows }: CinemaCardProps) {
  return (
    <div className="bg-primary rounded-lg overflow-hidden shadow-lg">
      <img 
        src={cinema.imageUrl} 
        alt={`${cinema.name} location`} 
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2">{cinema.name}</h3>
        <div className="flex items-start mb-4">
          <MapPin className="text-accent mt-1 mr-2 h-4 w-4" />
          <p className="text-gray-300 text-sm">
            {cinema.address}<br/>{cinema.city}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="text-yellow-500 mr-1 h-4 w-4" />
            <span className="text-gray-300">{cinema.rating?.toFixed(1) || '0.0'} ({cinema.reviewCount || 0})</span>
          </div>
          <Button
            variant="secondary"
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
            onClick={() => onViewShows && onViewShows(cinema.id)}
          >
            View Shows
          </Button>
        </div>
      </div>
    </div>
  );
}
