import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBooking } from "@/contexts/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import BookingSteps from "@/components/ui/booking-steps";
import BookingSummary from "@/components/ui/booking-summary";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BookingPayment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    movie,
    selectedShowtime,
    selectedSeats,
    tickets,
    getTotalPrice,
    confirmBooking
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  // Check if we have the required data to show this page
  useEffect(() => {
    if (!movie || !selectedShowtime || selectedSeats.length === 0) {
      setLocation("/");
      toast({
        title: "Missing information",
        description: "Please start the booking process again",
        variant: "destructive",
      });
    }
  }, [movie, selectedShowtime, selectedSeats, setLocation, toast]);

  const handleSubmit = async () => {
    // Basic form validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all payment fields",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would validate the card with a payment provider
      // Here we're just simulating a successful payment
      const bookingId = await confirmBooking();
      
      if (bookingId) {
        setLocation("/booking/confirmation");
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const totalAmount = getTotalPrice();
  const bookingFee = 200; // $2.00
  const taxes = Math.round(totalAmount * 0.1); // 10% tax
  const finalTotal = totalAmount + bookingFee + taxes;

  if (!movie || !selectedShowtime || selectedSeats.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Payment</h2>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/booking/seats")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        
        <BookingSteps currentStep={3} />
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BookingSummary className="mb-6" />
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Payment Method</h3>
              
              <Card className="bg-secondary mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Input 
                      type="radio" 
                      id="credit-card" 
                      name="payment-method" 
                      className="mr-2" 
                      defaultChecked 
                    />
                    <Label htmlFor="credit-card" className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      <span>Credit/Debit Card</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-number" className="block text-sm text-gray-400 mb-1">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="bg-gray-800 border border-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry-date" className="block text-sm text-gray-400 mb-1">Expiry Date</Label>
                        <Input
                          id="expiry-date"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          className="bg-gray-800 border border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="block text-sm text-gray-400 mb-1">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          className="bg-gray-800 border border-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardholder-name" className="block text-sm text-gray-400 mb-1">Cardholder Name</Label>
                      <Input
                        id="cardholder-name"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="bg-gray-800 border border-gray-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                    className="mr-2" 
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-400">
                    I agree to the <a href="#" className="text-accent">terms and conditions</a>
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="newsletter" className="mr-2" />
                  <Label htmlFor="newsletter" className="text-sm text-gray-400">
                    Email me about promotions and discounts
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total Payment</div>
            <div className="text-xl font-bold">{formatCurrency(finalTotal)}</div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-black"
              onClick={() => setLocation("/booking/seats")}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              className="bg-accent hover:bg-amber-600 text-black font-bold transition-colors"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Processing...
                </div> : 
                'Pay Now'
              }
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
