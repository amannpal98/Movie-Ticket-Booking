import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Film, 
  MonitorPlay 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, formatTime } from "@/lib/utils";
import AdminLayout from "@/components/layout/admin-layout";

// Form validation schema
const showtimeSchema = z.object({
  movieId: z.coerce.number().int().positive("Please select a movie"),
  screenId: z.coerce.number().int().positive("Please select a screen"),
  startTime: z.string().min(1, "Start time is required"),
  price: z.coerce.number().int().min(1, "Price must be at least 1 cent"),
});

type ShowtimeFormValues = z.infer<typeof showtimeSchema>;

export default function AdminShowtimes() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<any | null>(null);
  const [filterMovie, setFilterMovie] = useState<string>("");
  const [filterCinema, setFilterCinema] = useState<string>("");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch all showtimes (this endpoint isn't in the API but would be needed)
  // For now, we'll use a mock of what the data might look like
  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useQuery({
    queryKey: ['/api/admin/showtimes'],
    queryFn: async () => {
      // In a complete implementation, there would be a proper API endpoint
      // For now, we'll get showtimes through movies
      const moviesResponse = await fetch('/api/movies');
      const movies = await moviesResponse.json();
      
      const allShowtimes: any[] = [];
      
      for (const movie of movies) {
        const showtimesResponse = await fetch(`/api/movies/${movie.id}/showtimes`);
        const movieShowtimes = await showtimesResponse.json();
        
        // Enhance the showtime objects with the movie data
        for (const showtime of movieShowtimes) {
          allShowtimes.push({
            ...showtime,
            movie,
          });
        }
      }
      
      return allShowtimes;
    }
  });

  // Fetch all movies for the dropdown
  const { data: movies = [] } = useQuery({
    queryKey: ['/api/movies'],
  });

  // Fetch all cinemas for the dropdown
  const { data: cinemas = [] } = useQuery({
    queryKey: ['/api/cinemas'],
  });

  // Fetch all screens for the dropdown (depends on selected cinema)
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  
  const { data: screens = [] } = useQuery({
    queryKey: ['/api/cinemas', selectedCinemaId, 'screens'],
    queryFn: async () => {
      if (!selectedCinemaId) return [];
      
      const response = await fetch(`/api/cinemas/${selectedCinemaId}/screens`);
      return response.json();
    },
    enabled: !!selectedCinemaId,
  });

  // Add showtime mutation (note: this endpoint doesn't exist in the API)
  const addShowtimeMutation = useMutation({
    mutationFn: async (showtime: ShowtimeFormValues) => {
      // Calculate end time based on start time and movie duration
      const movie = movies.find(m => m.id === showtime.movieId);
      const startTime = new Date(showtime.startTime);
      const endTime = new Date(startTime);
      
      if (movie) {
        endTime.setMinutes(endTime.getMinutes() + movie.duration);
      } else {
        endTime.setMinutes(endTime.getMinutes() + 120); // Default 2 hours
      }
      
      const showtimeData = {
        ...showtime,
        endTime: endTime.toISOString(),
      };
      
      // In a real implementation, this would be a real API endpoint
      const response = await apiRequest('POST', '/api/admin/showtimes', showtimeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/showtimes'] });
      toast({
        title: "Success",
        description: "Showtime added successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add showtime: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete showtime mutation (note: this endpoint doesn't exist in the API)
  const deleteShowtimeMutation = useMutation({
    mutationFn: async (id: number) => {
      // In a real implementation, this would be a real API endpoint
      await apiRequest('DELETE', `/api/admin/showtimes/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/showtimes'] });
      toast({
        title: "Success",
        description: "Showtime deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete showtime: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Setup form with react-hook-form
  const form = useForm<ShowtimeFormValues>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: 0,
      screenId: 0,
      startTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm
      price: 1499, // $14.99
    }
  });

  // Handle cinema selection in form
  const handleCinemaChange = (cinemaId: string) => {
    setSelectedCinemaId(cinemaId);
    form.setValue("screenId", 0); // Reset screen selection when cinema changes
  };

  // Handle delete showtime
  const handleDeleteShowtime = (id: number) => {
    if (window.confirm("Are you sure you want to delete this showtime?")) {
      deleteShowtimeMutation.mutate(id);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingShowtime(null);
    setSelectedCinemaId(null);
    form.reset();
  };

  // Handle form submission
  const onSubmit = (data: ShowtimeFormValues) => {
    addShowtimeMutation.mutate(data);
  };

  // Filter showtimes based on selected movie and cinema
  const filteredShowtimes = showtimes.filter((showtime: any) => {
    const matchesMovie = !filterMovie || showtime.movie?.id.toString() === filterMovie;
    const matchesCinema = !filterCinema || showtime.cinema?.id.toString() === filterCinema;
    return matchesMovie && matchesCinema;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Showtimes</h3>
          <div className="flex items-center space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-amber-600 text-black">
                  <Plus className="mr-2 h-4 w-4" /> Add Showtime
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Add New Showtime</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="movieId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Movie</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a movie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0" disabled>Select a movie</SelectItem>
                              {movies.map((movie: any) => (
                                <SelectItem key={movie.id} value={movie.id.toString()}>
                                  {movie.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Cinema</FormLabel>
                        <Select onValueChange={handleCinemaChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cinema" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" disabled>Select a cinema</SelectItem>
                            {cinemas.map((cinema: any) => (
                              <SelectItem key={cinema.id} value={cinema.id.toString()}>
                                {cinema.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                      
                      <FormField
                        control={form.control}
                        name="screenId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Screen</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a screen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0" disabled>Select a screen</SelectItem>
                                {screens.map((screen: any) => (
                                  <SelectItem key={screen.id} value={screen.id.toString()}>
                                    {screen.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (in cents)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDialogClose}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-accent hover:bg-amber-600 text-black"
                        disabled={addShowtimeMutation.isPending}
                      >
                        {addShowtimeMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Saving...
                          </div>
                        ) : "Add Showtime"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="bg-secondary mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Filter by Movie</label>
                <Select onValueChange={setFilterMovie} value={filterMovie}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="All Movies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Movies</SelectItem>
                    {movies.map((movie: any) => (
                      <SelectItem key={movie.id} value={movie.id.toString()}>
                        {movie.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Filter by Cinema</label>
                <Select onValueChange={setFilterCinema} value={filterCinema}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="All Cinemas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cinemas</SelectItem>
                    {cinemas.map((cinema: any) => (
                      <SelectItem key={cinema.id} value={cinema.id.toString()}>
                        {cinema.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filterMovie || filterCinema) && (
              <div className="mt-4 flex items-center">
                <Filter className="h-4 w-4 text-accent mr-2" />
                <span className="text-sm">
                  Filtering by: {filterMovie && movies.find((m: any) => m.id.toString() === filterMovie)?.title}
                  {filterMovie && filterCinema && " at "}
                  {filterCinema && cinemas.find((c: any) => c.id.toString() === filterCinema)?.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 text-xs"
                  onClick={() => {
                    setFilterMovie("");
                    setFilterCinema("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-secondary">
          {isLoadingShowtimes ? (
            <CardContent className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Cinema</TableHead>
                    <TableHead>Screen</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShowtimes.length > 0 ? (
                    filteredShowtimes.map((showtime: any) => (
                      <TableRow key={showtime.id}>
                        <TableCell>{showtime.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Film className="h-4 w-4 text-accent" />
                            <span className="font-medium">{showtime.movie?.title || "Unknown Movie"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{showtime.cinema?.name || "Unknown Cinema"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MonitorPlay className="h-4 w-4 text-blue-500" />
                            <span>{showtime.screen?.name || "Unknown Screen"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span>{formatDate(showtime.startTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span>{formatTime(showtime.startTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>${(showtime.price / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteShowtime(showtime.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        {(filterMovie || filterCinema) ? 
                          "No showtimes found matching your filters" : 
                          "No showtimes available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
