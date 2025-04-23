import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useBooking } from "@/contexts/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TicketCard from "@/components/ui/ticket-card";
import { Download, CheckCircle, Home } from "lucide-react";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { resetBooking } = useBooking();

  // Fetch the most recent booking
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const mostRecentBooking = bookings.length > 0 ? bookings[0] : null;

  // Reset the booking context once we've loaded the confirmation page
  useEffect(() => {
    if (mostRecentBooking) {
      resetBooking();
    }
  }, [mostRecentBooking, resetBooking]);

  const handleHome = () => {
    setLocation("/");
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF ticket
    toast({
      title: "Downloading Tickets",
      description: "Your tickets are being downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!mostRecentBooking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">No Recent Booking Found</h2>
            <p className="text-gray-300 mb-6">
              We couldn't find any recent bookings. Please try making a new booking.
            </p>
            <Button onClick={handleHome} className="bg-accent hover:bg-amber-600 text-black">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-300 mb-6">
            Your tickets have been booked successfully. An email with your tickets has been sent to your registered email address.
          </p>
          
          <TicketCard 
            booking={mostRecentBooking} 
            className="mx-auto max-w-md mb-6"
          />
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="secondary"
              className="flex items-center"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" /> Download Tickets
            </Button>
            <Button 
              className="bg-accent hover:bg-amber-600 text-black flex items-center"
              onClick={handleHome}
            >
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
