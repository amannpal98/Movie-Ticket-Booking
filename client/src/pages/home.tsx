import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/ui/movie-card";
import CinemaCard from "@/components/ui/cinema-card";
import OfferCard from "@/components/ui/offer-card";
import MovieHero from "@/components/ui/movie-hero";

export default function Home() {
  const [featuredMovieIndex, setFeaturedMovieIndex] = useState(0);

  // Fetch movies that are currently showing
  const { data: nowShowingMovies = [] } = useQuery({
    queryKey: ['/api/movies/now-showing']
  });

  // Fetch upcoming movies
  const { data: comingSoonMovies = [] } = useQuery({
    queryKey: ['/api/movies/coming-soon']
  });

  // Fetch cinemas
  const { data: cinemas = [] } = useQuery({
    queryKey: ['/api/cinemas']
  });

  // Get a featured movie for the hero section
  const featuredMovie = nowShowingMovies[featuredMovieIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero Section */}
      {featuredMovie && <MovieHero movie={featuredMovie} />}
      
      {/* Now Showing Section */}
      <section id="movies" className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Now Showing</h2>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full"
              onClick={() => {
                if (nowShowingMovies.length > 0) {
                  setFeaturedMovieIndex((prev) => 
                    (prev - 1 + nowShowingMovies.length) % nowShowingMovies.length
                  );
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full"
              onClick={() => {
                if (nowShowingMovies.length > 0) {
                  setFeaturedMovieIndex((prev) => 
                    (prev + 1) % nowShowingMovies.length
                  );
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {nowShowingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
      
      {/* Coming Soon Section */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Coming Soon</h2>
          <div className="hidden sm:block">
            <Link href="/coming-soon" className="text-accent hover:text-amber-500 font-medium flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {comingSoonMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              variant="comingSoon" 
              className="w-52"
            />
          ))}
        </div>
      </section>
      
      {/* Cinemas Section */}
      <section id="cinemas" className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Our Cinemas</h2>
          <div className="hidden sm:block">
            <Link href="/cinemas" className="text-accent hover:text-amber-500 font-medium flex items-center">
              View All <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <CinemaCard
              key={cinema.id}
              cinema={cinema}
              onViewShows={(cinemaId) => {
                // In a real app, this would navigate to the cinema's showtimes page
                console.log(`View shows for cinema ${cinemaId}`);
              }}
            />
          ))}
        </div>
      </section>
      
      {/* Special Offers Section */}
      <section id="offers" className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Special Offers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OfferCard
            title="All Tickets 30% Off!"
            subtitle="TUESDAY SPECIAL"
            description="Every Tuesday, enjoy all movies at discounted price. Offer valid for all seats and shows."
            imageUrl="https://images.unsplash.com/photo-1586899028174-e7098604235b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
            buttonText="Learn More"
            gradientFrom="blue-900"
            gradientTo="indigo-900"
            onClick={() => {
              // In a real app, this would navigate to the offer details page
              console.log('View Tuesday special offer');
            }}
          />
          
          <OfferCard
            title="Join CineClub!"
            subtitle="MEMBERSHIP DEAL"
            description="Get exclusive benefits, free popcorn, and ticket discounts. Free premium seat upgrades."
            imageUrl="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
            buttonText="Join Now"
            gradientFrom="purple-900"
            gradientTo="pink-900"
            onClick={() => {
              // In a real app, this would navigate to the membership signup page
              console.log('Join CineClub membership');
            }}
          />
        </div>
      </section>
    </div>
  );
}
