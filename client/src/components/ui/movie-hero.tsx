import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Play, Star, Clock, Calendar } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface Movie {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  posterUrl?: string;
  releaseYear: number;
  duration: number;
  rating: string;
  imdbRating?: number;
  genres: string[];
  trailer?: string;
}

interface MovieHeroProps {
  movie: Movie;
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const handleTrailerClick = () => {
    if (movie.trailer) {
      window.open(movie.trailer, '_blank');
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="relative rounded-2xl overflow-hidden h-[350px] md:h-[450px] lg:h-[500px] shadow-xl">
        <img 
          src={movie.bannerUrl} 
          alt={`${movie.title} banner`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent flex items-end">
          <div className="p-6 md:p-10 lg:max-w-3xl">
            <div className="mb-2 md:mb-4 flex flex-wrap gap-2">
              {movie.genres.map((genre, index) => (
                <span 
                  key={index} 
                  className={index === 0 ? "bg-accent text-black text-xs font-bold px-2 py-1 rounded" : "bg-gray-800 text-white text-xs px-2 py-1 rounded"}
                >
                  {genre.toUpperCase()}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">{movie.title}</h1>
            <p className="text-gray-300 mb-4 md:mb-6 lg:w-3/4">{movie.description}</p>
            <div className="flex flex-wrap items-center text-sm text-gray-300 gap-4 mb-6">
              {movie.imdbRating && (
                <div className="flex items-center">
                  <Star className="text-yellow-500 mr-1 h-4 w-4" />
                  <span>{movie.imdbRating.toFixed(1)}/10</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div>{movie.rating}</div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{movie.releaseYear}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/booking/${movie.id}`}>
                <Button className="bg-accent hover:bg-amber-600 text-black font-medium transition-colors">
                  <span className="mr-2">🎟️</span> Book Tickets
                </Button>
              </Link>
              {movie.trailer && (
                <Button 
                  variant="secondary" 
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
                  onClick={handleTrailerClick}
                >
                  <Play className="mr-2 h-4 w-4" /> Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
