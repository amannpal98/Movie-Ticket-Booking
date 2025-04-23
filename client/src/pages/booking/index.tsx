import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useBooking } from "@/contexts/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BookingSteps from "@/components/ui/booking-steps";
import { formatDate, formatTime, getDatesForNext7Days } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

interface BookingIndexProps {
  movieId: string;
}

export default function BookingIndex({ movieId }: BookingIndexProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    setMovie,
    selectedDate,
    setSelectedDate,
    selectedShowtime,
    setSelectedShowtime,
    tickets,
    updateTicketCount
  } = useBooking();

  // Get URL params
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedShowtimeId = searchParams.get('showtimeId');

  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
  });

  // Set the movie in the booking context once loaded
  useEffect(() => {
    if (movie) {
      setMovie(movie);
    }
  }, [movie, setMovie]);

  // Dates for selection
  const next7Days = getDatesForNext7Days();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Update the selected date when the index changes
  useEffect(() => {
    if (next7Days.length > 0) {
      setSelectedDate(next7Days[selectedDateIndex]);
    }
  }, [selectedDateIndex, next7Days, setSelectedDate]);

  // Fetch showtimes for this movie and date
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useQuery({
    queryKey: [`/api/movies/${movieId}/showtimes/date/${formattedDate}`],
    enabled: !!movieId && !!formattedDate,
  });

  // If a showtime is preselected in the URL, set it
  useEffect(() => {
    if (preselectedShowtimeId && showtimes.length > 0 && !selectedShowtime) {
      const showtime = showtimes.find(s => s.id.toString() === preselectedShowtimeId);
      if (showtime) {
        setSelectedShowtime(showtime);
      }
    }
  }, [preselectedShowtimeId, showtimes, selectedShowtime, setSelectedShowtime]);

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

  const handleContinue = () => {
    if (!selectedShowtime) {
      toast({
        title: "No showtime selected",
        description: "Please select a showtime to continue",
        variant: "destructive",
      });
      return;
    }

    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.count, 0);
    if (totalTickets === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to continue",
        variant: "destructive",
      });
      return;
    }

    setLocation("/booking/seats");
  };

  const handleTicketChange = (type: string, change: number) => {
    const ticket = tickets.find(t => t.type === type);
    if (ticket) {
      const newCount = Math.max(0, ticket.count + change);
      updateTicketCount(type, newCount);
    }
  };

  const totalAmount = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.count), 0);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Book Tickets</h2>
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/movies/${movieId}`)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        
        <BookingSteps currentStep={1} />
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center mb-6">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-16 h-24 object-cover rounded"
            />
            <div className="ml-4">
              <h3 className="font-bold text-lg">{movie.title}</h3>
              <div className="text-sm text-gray-400">
                {movie.rating} | {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Select Date</h4>
            <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar">
              {next7Days.map((date, index) => (
                <Button
                  key={index}
                  variant={selectedDateIndex === index ? "default" : "secondary"}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 ${
                    selectedDateIndex === index ? "bg-accent text-black" : ""
                  }`}
                  onClick={() => setSelectedDateIndex(index)}
                >
                  <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                  <div className="text-xl font-bold">{date.getDate()}</div>
                  <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Select Time</h4>
            
            {isLoadingShowtimes ? (
              <div className="py-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : Object.keys(showtimesByCinema).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(showtimesByCinema).map(([cinemaId, cinemaShowtimes]) => {
                  const cinema = cinemaShowtimes[0].cinema;
                  return (
                    <div key={cinemaId}>
                      <div className="text-sm text-gray-300 font-medium mb-2">{cinema.name}</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {cinemaShowtimes.map((showtime) => (
                          <Button
                            key={showtime.id}
                            variant={selectedShowtime?.id === showtime.id ? "default" : "secondary"}
                            className={`text-sm ${
                              selectedShowtime?.id === showtime.id ? "bg-accent text-black" : ""
                            }`}
                            onClick={() => setSelectedShowtime(showtime)}
                          >
                            {formatTime(showtime.startTime)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-400">
                No showtimes available for {formatDate(selectedDate)}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Select Number of Tickets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.type} className="bg-secondary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ticket.type}</div>
                        <div className="text-sm text-gray-400">${(ticket.price / 100).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="secondary"
                          size="icon"
                          className="w-8 h-8 rounded-full"
                          onClick={() => handleTicketChange(ticket.type, -1)}
                          disabled={ticket.count === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-4 font-medium">{ticket.count}</span>
                        <Button 
                          variant="secondary"
                          size="icon"
                          className="w-8 h-8 rounded-full"
                          onClick={() => handleTicketChange(ticket.type, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-xl font-bold">${(totalAmount / 100).toFixed(2)}</div>
          </div>
          <Button 
            className="bg-accent hover:bg-amber-600 text-black font-bold transition-colors"
            onClick={handleContinue}
          >
            Continue to Seats <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
