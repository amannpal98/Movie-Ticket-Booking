import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Star, 
  Clock, 
  Calendar, 
  Film, 
  Users, 
  PlayCircle, 
  ChevronRight, 
  Eye 
} from "lucide-react";
import { formatDate, formatDuration, formatTime, extractYoutubeId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface MovieDetailsProps {
  id: string;
}

export default function MovieDetails({ id }: MovieDetailsProps) {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: [`/api/movies/${id}`],
  });

  // Fetch showtimes for this movie
  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useQuery({
    queryKey: [`/api/movies/${id}/showtimes/date/${selectedDate}`],
    enabled: !!id && !!selectedDate,
  });

  // Group showtimes by cinema
  const showtimesByCinema: Record<string, any[]> = {};
  
  if (showtimes && showtimes.length > 0) {
    showtimes.forEach((showtime: any) => {
      if (showtime.cinema) {
        const cinemaId = showtime.cinema.id;
        if (!showtimesByCinema[cinemaId]) {
          showtimesByCinema[cinemaId] = [];
        }
        showtimesByCinema[cinemaId].push(showtime);
      }
    });
  }

  // Generate dates for the next 7 days for date selection
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date,
      value: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  if (isLoadingMovie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold">Movie not found</h1>
      </div>
    );
  }

  const youtubeId = movie.trailer ? extractYoutubeId(movie.trailer) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Movie Banner */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <img 
          src={movie.bannerUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent">
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Star className="text-yellow-500 mr-1 h-4 w-4" />
                <span>{movie.imdbRating}/10</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div>{movie.rating}</div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{movie.releaseYear}</span>
              </div>
              {movie.genres.map((genre, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 text-white text-xs px-2 py-1 rounded"
                >
                  {genre.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          
          {movie.trailer && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent bg-opacity-90 hover:bg-opacity-100 text-black rounded-full w-16 h-16 flex items-center justify-center"
                >
                  <PlayCircle className="h-10 w-10" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{movie.title} - Trailer</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full">
                  {youtubeId && (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={`${movie.title} trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="synopsis">
            <TabsList className="mb-4">
              <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
              <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="synopsis">
              <h3 className="text-xl font-semibold mb-4">Synopsis</h3>
              <p className="text-gray-300 mb-6">{movie.description}</p>
            </TabsContent>
            
            <TabsContent value="cast">
              <h3 className="text-xl font-semibold mb-4">Cast & Crew</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {/* In a real app, this would be populated from the API */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Denis Villeneuve</div>
                    <div className="text-xs text-gray-400">Director</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                    <Film className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Lead Actor</div>
                    <div className="text-xs text-gray-400">Main Character</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <h3 className="text-xl font-semibold mb-4">Reviews</h3>
              <div className="space-y-4 mb-6">
                {/* In a real app, these would be actual reviews from the API */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center text-yellow-500 mr-2">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <div className="text-sm font-medium">5/5</div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      "An epic cinematic achievement. The visuals are stunning and the performances are outstanding."
                    </p>
                    <div className="text-gray-400 text-xs mt-2">Roger E. - Film Critic</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center text-yellow-500 mr-2">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-medium">4/5</div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      "A worthy addition to the franchise that delivers on its promise. Some pacing issues in the middle, but the finale makes up for it."
                    </p>
                    <div className="text-gray-400 text-xs mt-2">Sarah M. - Verified Viewer</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Showtimes */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Showtimes</h3>
          <Card className="bg-secondary mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Select Date</h4>
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                {next7Days.map((day, index) => (
                  <Button
                    key={day.value}
                    variant={selectedDate === day.value ? "default" : "secondary"}
                    className={`flex-shrink-0 flex flex-col items-center justify-center h-20 ${
                      selectedDate === day.value ? "bg-accent text-black" : ""
                    }`}
                    onClick={() => setSelectedDate(day.value)}
                  >
                    <div className="text-xs">{day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                    <div className="text-xl font-bold">{day.date.getDate()}</div>
                    <div className="text-xs">{day.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                  </Button>
                ))}
              </div>
              
              {isLoadingShowtimes ? (
                <div className="py-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : Object.keys(showtimesByCinema).length > 0 ? (
                <div className="mt-4 space-y-4">
                  {Object.entries(showtimesByCinema).map(([cinemaId, cinemaShowtimes]) => {
                    const cinema = cinemaShowtimes[0].cinema;
                    return (
                      <div key={cinemaId}>
                        <div className="text-sm text-gray-300 font-medium mb-2">{cinema.name}</div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {cinemaShowtimes.map((showtime) => (
                            <Button
                              key={showtime.id}
                              variant="secondary"
                              className="text-sm"
                              onClick={() => setLocation(`/booking/${movie.id}?showtimeId=${showtime.id}`)}
                            >
                              {formatTime(showtime.startTime)}
                            </Button>
                          ))}
                        </div>
                        <Separator className="my-3" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-gray-400">
                  No showtimes available for this date
                </div>
              )}
            </CardContent>
          </Card>
          
          <Link href={`/booking/${movie.id}`}>
            <Button className="w-full bg-accent hover:bg-amber-600 text-black font-bold py-3 transition-colors">
              Book Tickets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
