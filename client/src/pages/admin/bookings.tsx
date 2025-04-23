import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  RefreshCw,
  Search,
  User,
  Clock,
  Calendar,
  Film,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminBookings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/bookings/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update booking status: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Filter bookings based on status and search query
  const filteredBookings = bookings.filter((booking: any) => {
    const matchesStatus = !filterStatus || booking.status === filterStatus;
    const matchesSearch = !searchQuery || 
      booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.user?.fullName && booking.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.movie?.title && booking.movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-900 text-green-500";
      case 'pending':
        return "bg-yellow-900 text-yellow-500";
      case 'cancelled':
        return "bg-red-900 text-red-500";
      default:
        return "bg-gray-900 text-gray-500";
    }
  };

  // Handle view booking details
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (!selectedBooking) return;
    
    if (window.confirm(`Are you sure you want to change the booking status to ${status}?`)) {
      updateBookingStatusMutation.mutate({ 
        id: selectedBooking.id, 
        status 
      });
    }
  };

  // Group booking seats by row
  const groupSeatsByRow = (seats: any[]) => {
    if (!seats || seats.length === 0) return {};
    
    const seatsByRow: Record<string, string[]> = {};
    
    seats.forEach(seat => {
      const row = seat.seatNumber.charAt(0);
      const seatNum = seat.seatNumber.substring(1);
      
      if (!seatsByRow[row]) {
        seatsByRow[row] = [];
      }
      
      seatsByRow[row].push(seatNum);
    });
    
    return seatsByRow;
  };

  // Format seats display
  const formatSeatsDisplay = (seats: any[]) => {
    if (!seats || seats.length === 0) return "No seats";
    
    const seatsByRow = groupSeatsByRow(seats);
    
    return Object.entries(seatsByRow).map(([row, seats]) => {
      // Sort seat numbers numerically
      const sortedSeats = seats.sort((a, b) => parseInt(a) - parseInt(b));
      return `Row ${row}: ${sortedSeats.join(', ')}`;
    }).join('; ');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Bookings</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] })}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="bg-secondary mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              <div>
                <Select onValueChange={setFilterStatus} value={filterStatus}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filterStatus || searchQuery) && (
              <div className="mt-4 flex items-center">
                <FilterIcon className="h-4 w-4 text-accent mr-2" />
                <span className="text-sm">
                  {filterStatus && `Status: ${filterStatus}`}
                  {filterStatus && searchQuery && " | "}
                  {searchQuery && `Search: "${searchQuery}"`}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 text-xs"
                  onClick={() => {
                    setFilterStatus("");
                    setSearchQuery("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-secondary">
          {isLoading ? (
            <CardContent className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking: any) => (
                      <TableRow key={booking.id} className="border-b border-gray-700">
                        <TableCell className="font-medium">#{booking.bookingReference}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Film className="h-4 w-4 text-accent" />
                            <span>{booking.movie?.title || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span>{booking.user?.fullName || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.showtime ? (
                            <div className="flex flex-col">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-green-500" />
                                {formatDate(booking.showtime.startTime)}
                              </span>
                              <span className="flex items-center text-sm text-gray-400">
                                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                                {formatTime(booking.showtime.startTime)}
                              </span>
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBooking(booking)}
                            className="mr-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        {(filterStatus || searchQuery) ? 
                          "No bookings found matching your criteria" : 
                          "No bookings available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
      
      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">#{selectedBooking.bookingReference}</span>
                  <Badge 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBooking.status)}`}
                  >
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Select defaultValue={selectedBooking.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirm</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Date & Time</h4>
                  {selectedBooking.showtime ? (
                    <div className="text-sm">
                      {formatDate(selectedBooking.showtime.startTime)}, {formatTime(selectedBooking.showtime.startTime)}
                    </div>
                  ) : 'N/A'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Created</h4>
                  <div className="text-sm">{formatDate(selectedBooking.createdAt)}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Movie</h4>
                <div className="flex items-start">
                  {selectedBooking.movie?.posterUrl && (
                    <img 
                      src={selectedBooking.movie.posterUrl} 
                      alt={selectedBooking.movie.title} 
                      className="w-12 h-18 object-cover rounded mr-3"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{selectedBooking.movie?.title || 'N/A'}</div>
                    {selectedBooking.movie && (
                      <div className="text-sm text-gray-400">
                        {selectedBooking.movie.rating} • {Math.floor(selectedBooking.movie.duration / 60)}h {selectedBooking.movie.duration % 60}m
                      </div>
                    )}
                    <div className="flex items-center text-sm mt-1">
                      <MapPin className="h-3 w-3 text-accent mr-1" />
                      {selectedBooking.cinema?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Customer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Name</div>
                    <div>{selectedBooking.user?.fullName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Email</div>
                    <div>{selectedBooking.user?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Booking Details</h4>
                <div className="bg-gray-800 rounded-md p-3 text-sm">
                  <div className="mb-2">
                    <span className="text-gray-400">Seats: </span>
                    <span>{formatSeatsDisplay(selectedBooking.seats)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ticket Types: </span>
                    <span>
                      {selectedBooking.seats ? 
                        [...new Set(selectedBooking.seats.map((s: any) => s.ticketType))].join(', ') : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Payment</h4>
                <div className="flex justify-between items-center">
                  <span>Total Amount</span>
                  <span className="font-bold">{formatCurrency(selectedBooking.totalAmount)}</span>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" size="sm" className="mr-2">
                  <DownloadIcon className="h-4 w-4 mr-1" /> Download Ticket
                </Button>
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-amber-600 text-black"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
