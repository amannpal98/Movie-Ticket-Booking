import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart4,
  Calendar,
  CreditCard,
  Download,
  Film,
  RefreshCcw,
  Users 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch all bookings for the dashboard
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  // Calculate dashboard metrics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  // Count unique movies from bookings
  const uniqueMovieIds = new Set();
  bookings.forEach(booking => {
    if (booking.movie?.id) {
      uniqueMovieIds.add(booking.movie.id);
    }
  });
  const activeShows = uniqueMovieIds.size;

  // Count unique users from bookings
  const uniqueUserIds = new Set();
  bookings.forEach(booking => {
    if (booking.user?.id) {
      uniqueUserIds.add(booking.user.id);
    }
  });
  const newUsers = uniqueUserIds.size;

  if (isLoadingBookings) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Dashboard Overview</h3>
          <div className="flex items-center space-x-2">
            <Select defaultValue="7days">
              <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="icon">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Bookings</div>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <div className="text-xs text-green-500 mt-1 flex items-center">
                    <ArrowUpIcon className="mr-1 h-3 w-3" />12% from last week
                  </div>
                </div>
                <div className="bg-blue-900 bg-opacity-30 p-2 rounded-md">
                  <CreditCard className="text-blue-500 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Revenue</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <div className="text-xs text-green-500 mt-1 flex items-center">
                    <ArrowUpIcon className="mr-1 h-3 w-3" />8% from last week
                  </div>
                </div>
                <div className="bg-green-900 bg-opacity-30 p-2 rounded-md">
                  <CreditCard className="text-green-500 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Active Shows</div>
                  <div className="text-2xl font-bold">{activeShows}</div>
                  <div className="text-xs text-red-500 mt-1 flex items-center">
                    <ArrowDownIcon className="mr-1 h-3 w-3" />3% from last week
                  </div>
                </div>
                <div className="bg-purple-900 bg-opacity-30 p-2 rounded-md">
                  <Film className="text-purple-500 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Users</div>
                  <div className="text-2xl font-bold">{newUsers}</div>
                  <div className="text-xs text-green-500 mt-1 flex items-center">
                    <ArrowUpIcon className="mr-1 h-3 w-3" />18% from last week
                  </div>
                </div>
                <div className="bg-yellow-900 bg-opacity-30 p-2 rounded-md">
                  <Users className="text-yellow-500 h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Revenue Overview</h4>
            <Button variant="link" className="text-accent p-0">View Details</Button>
          </div>
          
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart4 className="h-12 w-12 mx-auto mb-2" />
                  <div>Revenue data visualization would appear here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Recent Bookings</h4>
            <Link href="/admin/bookings">
              <Button variant="link" className="text-accent p-0">View All</Button>
            </Link>
          </div>
          
          <Card className="bg-secondary">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Booking ID</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Movie</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Date & Time</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-700">
                      <td className="p-4">#{booking.bookingReference}</td>
                      <td className="p-4">{booking.movie?.title || 'N/A'}</td>
                      <td className="p-4">{booking.user?.fullName || 'N/A'}</td>
                      <td className="p-4">
                        {booking.showtime ? new Date(booking.showtime.startTime).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4">{formatCurrency(booking.totalAmount)}</td>
                      <td className="p-4">
                        <span 
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                            ${booking.status === 'confirmed' ? 'bg-green-900 text-green-500' : 
                              booking.status === 'pending' ? 'bg-yellow-900 text-yellow-500' : 
                              'bg-red-900 text-red-500'
                            }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex">
                          <Button variant="ghost" size="sm" className="mr-1">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
