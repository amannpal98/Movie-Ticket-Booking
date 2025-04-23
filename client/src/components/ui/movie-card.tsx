import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: number;
  duration: number;
  rating: string;
  imdbRating?: number;
  isNowShowing?: boolean;
  isComingSoon?: boolean;
  releaseDate?: Date | string;
}

interface MovieCardProps {
  movie: Movie;
  className?: string;
  variant?: 'default' | 'slim' | 'comingSoon';
}

export default function MovieCard({ movie, className, variant = 'default' }: MovieCardProps) {
  if (variant === 'comingSoon') {
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
    const formattedDate = releaseDate 
      ? releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) 
      : 'Coming Soon';

    return (
      <div className={cn("movie-card flex-shrink-0 bg-primary rounded-lg overflow-hidden shadow-lg", className)}>
        <div className="relative">
          <img 
            src={movie.posterUrl} 
            alt={`${movie.title} poster`} 
            className="w-full h-72 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <div className="text-xs text-white font-medium">Coming {formattedDate}</div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-md mb-1 truncate">{movie.title}</h3>
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <span>{movie.releaseYear}</span>
            {movie.rating && (
              <>
                <span className="mx-1">•</span>
                <span>{movie.rating}</span>
              </>
            )}
          </div>
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-black font-medium transition-colors">
            Notify Me
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'slim') {
    return (
      <div className={cn("flex bg-primary rounded-lg overflow-hidden shadow-lg", className)}>
        <img 
          src={movie.posterUrl} 
          alt={`${movie.title} poster`}
          className="w-20 h-30 object-cover"
        />
        <div className="p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-1">{movie.title}</h3>
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <span>{movie.releaseYear}</span>
              {movie.rating && (
                <>
                  <span className="mx-1">•</span>
                  <span>{movie.rating}</span>
                </>
              )}
              {movie.duration && (
                <>
                  <span className="mx-1">•</span>
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                </>
              )}
            </div>
            {movie.imdbRating && (
              <div className="flex items-center text-xs">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                <span>{movie.imdbRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <Link href={`/movies/${movie.id}`}>
            <Button size="sm" variant="ghost" className="text-xs mt-2">View Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("movie-card bg-primary rounded-lg overflow-hidden shadow-lg", className)}>
      <div className="relative">
        <img 
          src={movie.posterUrl} 
          alt={`${movie.title} poster`} 
          className="w-full h-64 object-cover"
        />
        {movie.imdbRating && (
          <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 text-white text-xs font-bold rounded px-2 py-1">
            <Star className="h-3 w-3 text-yellow-500 inline mr-1" />
            {movie.imdbRating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-md mb-1 truncate">{movie.title}</h3>
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <span>{movie.releaseYear}</span>
          {movie.rating && (
            <>
              <span className="mx-1">•</span>
              <span>{movie.rating}</span>
            </>
          )}
          {movie.duration && (
            <>
              <span className="mx-1">•</span>
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            </>
          )}
        </div>
        <Link href={`/booking/${movie.id}`}>
          <Button className="w-full bg-accent hover:bg-amber-600 text-black font-medium transition-colors">
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
