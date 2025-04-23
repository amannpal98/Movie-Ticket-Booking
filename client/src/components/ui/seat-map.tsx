import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/contexts/booking-context';
import { useQuery } from '@tanstack/react-query';

interface SeatMapProps {
  showtimeId: number;
  className?: string;
}

interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  rowLabels: string[];
}

interface BookedSeat {
  id: number;
  bookingId: number;
  seatNumber: string;
}

export default function SeatMap({ showtimeId, className }: SeatMapProps) {
  const { selectedSeats, toggleSeatSelection } = useBooking();
  
  // Fetch already booked seats for this showtime
  const { data: bookedSeats = [], isLoading } = useQuery({
    queryKey: [`/api/showtimes/${showtimeId}/seats`],
    enabled: !!showtimeId
  });

  // Hard-coded seat layout (in a real app, this would come from the API)
  const seatLayout: SeatLayout = {
    rows: 7,
    seatsPerRow: 8,
    rowLabels: ["A", "B", "C", "D", "E", "F", "G"]
  };

  const isSeatBooked = (row: string, seat: number): boolean => {
    const seatNumber = `${row}${seat}`;
    return bookedSeats.some((bookedSeat: BookedSeat) => bookedSeat.seatNumber === seatNumber);
  };

  const isSeatSelected = (row: string, seat: number): boolean => {
    const seatNumber = `${row}${seat}`;
    return selectedSeats.some(selectedSeat => selectedSeat.seatNumber === seatNumber);
  };

  const handleSeatClick = (row: string, seat: number) => {
    const seatNumber = `${row}${seat}`;
    toggleSeatSelection(seatNumber);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <div className="w-3/4 mx-auto h-8 bg-gray-800 rounded-t-3xl flex items-center justify-center text-gray-400 text-sm">SCREEN</div>
      <div className="w-3/4 mx-auto h-2 bg-accent mb-8"></div>
      
      <div className="grid grid-cols-10 gap-1 mb-8 justify-center">
        {seatLayout.rowLabels.map((row, rowIndex) => (
          <>
            <div key={`row-label-left-${rowIndex}`} className="flex items-center justify-center h-8 text-gray-400 text-sm">{row}</div>
            {Array.from({ length: seatLayout.seatsPerRow }, (_, seatIndex) => {
              const seat = seatIndex + 1;
              const isBooked = isSeatBooked(row, seat);
              const isSelected = isSeatSelected(row, seat);
              
              return (
                <div
                  key={`seat-${row}-${seat}`}
                  className={cn(
                    "cinema-seat w-8 h-8 rounded-t-lg",
                    isBooked ? "bg-gray-900" : 
                    isSelected ? "bg-accent selected" : 
                    "bg-gray-700 cursor-pointer"
                  )}
                  onClick={() => !isBooked && handleSeatClick(row, seat)}
                />
              );
            })}
            <div key={`row-label-right-${rowIndex}`} className="flex items-center justify-center h-8 text-gray-400 text-sm">{row}</div>
          </>
        ))}
      </div>
      
      <div className="flex justify-center space-x-8 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-700 rounded-t-sm mr-2"></div>
          <span className="text-gray-300">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-accent rounded-t-sm mr-2"></div>
          <span className="text-gray-300">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-900 rounded-t-sm mr-2"></div>
          <span className="text-gray-300">Occupied</span>
        </div>
      </div>
    </div>
  );
}
