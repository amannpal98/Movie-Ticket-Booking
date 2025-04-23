import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBooking } from "@/contexts/booking-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BookingSteps from "@/components/ui/booking-steps";
import BookingSummary from "@/components/ui/booking-summary";
import SeatMap from "@/components/ui/seat-map";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BookingSeats() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    movie,
    selectedShowtime,
    selectedSeats,
    tickets,
  } = useBooking();

  // Check if we have the required data to show this page
  useEffect(() => {
    if (!movie || !selectedShowtime) {
      setLocation("/");
      toast({
        title: "Missing information",
        description: "Please start the booking process again",
        variant: "destructive",
      });
    }
  }, [movie, selectedShowtime, setLocation, toast]);

  // Count total tickets
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.count, 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedSeats.length !== totalTickets) {
      toast({
        title: "Seat selection incomplete",
        description: `Please select ${totalTickets} seats to match your tickets`,
        variant: "destructive",
      });
      return;
    }

    setLocation("/booking/payment");
  };

  if (!movie || !selectedShowtime) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Select Your Seats</h2>
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/booking/${movie.id}`)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        
        <BookingSteps currentStep={2} />
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SeatMap 
                showtimeId={selectedShowtime.id} 
                className="mb-6"
              />
              
              <div className="bg-secondary p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Selected Seats</h4>
                <div className="text-gray-300">
                  {selectedSeats.length > 0 ? (
                    <div>
                      {selectedSeats.map((seat, index) => (
                        <span key={seat.seatNumber}>
                          {seat.seatNumber}
                          {index < selectedSeats.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div>No seats selected yet</div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-400 mt-2">
                <p>Please select {totalTickets} seat{totalTickets !== 1 ? 's' : ''} to match your tickets.</p>
                <p>You have selected {selectedSeats.length} of {totalTickets} seats.</p>
              </div>
            </div>
            
            <div>
              <BookingSummary showSeats={true} />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation(`/booking/${movie.id}`)}
            className="border-accent text-accent hover:bg-accent hover:text-black"
          >
            Back
          </Button>
          <Button 
            className="bg-accent hover:bg-amber-600 text-black font-bold transition-colors"
            onClick={handleContinue}
          >
            Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
