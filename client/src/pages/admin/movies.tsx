import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Film, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/layout/admin-layout";

// Form validation schema
const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  posterUrl: z.string().url("Poster URL must be a valid URL"),
  bannerUrl: z.string().url("Banner URL must be a valid URL"),
  releaseYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  rating: z.string().min(1, "Rating is required"),
  imdbRating: z.coerce.number().min(0).max(10).optional().nullable(),
  genres: z.string().min(1, "At least one genre is required"),
  trailer: z.string().url("Trailer URL must be a valid URL").optional().nullable(),
  isNowShowing: z.boolean().default(true),
  isComingSoon: z.boolean().default(false),
  releaseDate: z.string().optional().nullable(),
});

type MovieFormValues = z.infer<typeof movieSchema>;

export default function AdminMovies() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch all movies
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['/api/movies'],
  });

  // Add movie mutation
  const addMovieMutation = useMutation({
    mutationFn: async (movie: MovieFormValues) => {
      // Convert genres from comma-separated string to array
      const genresArray = movie.genres.split(',').map(genre => genre.trim());
      
      // Format the movie data
      const movieData = {
        ...movie,
        genres: genresArray,
      };
      
      const response = await apiRequest('POST', '/api/admin/movies', movieData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      toast({
        title: "Success",
        description: "Movie added successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add movie: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update movie mutation
  const updateMovieMutation = useMutation({
    mutationFn: async ({ id, movie }: { id: number; movie: MovieFormValues }) => {
      // Convert genres from comma-separated string to array
      const genresArray = movie.genres.split(',').map(genre => genre.trim());
      
      // Format the movie data
      const movieData = {
        ...movie,
        genres: genresArray,
      };
      
      const response = await apiRequest('PUT', `/api/admin/movies/${id}`, movieData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      toast({
        title: "Success",
        description: "Movie updated successfully",
      });
      setIsDialogOpen(false);
      setEditingMovie(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update movie: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete movie mutation
  const deleteMovieMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/movies/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete movie: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Setup form with react-hook-form
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      description: "",
      posterUrl: "",
      bannerUrl: "",
      releaseYear: new Date().getFullYear(),
      duration: 120,
      rating: "PG-13",
      imdbRating: 0,
      genres: "",
      trailer: "",
      isNowShowing: true,
      isComingSoon: false,
      releaseDate: "",
    }
  });

  // Handle edit movie
  const handleEditMovie = (movie: any) => {
    // Convert genres array to comma-separated string for form
    const genresString = movie.genres.join(', ');
    
    // Format release date if exists
    const releaseDate = movie.releaseDate 
      ? new Date(movie.releaseDate).toISOString().split('T')[0]
      : null;
    
    setEditingMovie(movie);
    form.reset({
      ...movie,
      genres: genresString,
      releaseDate,
    });
    setIsDialogOpen(true);
  };

  // Handle delete movie
  const handleDeleteMovie = (id: number) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      deleteMovieMutation.mutate(id);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMovie(null);
    form.reset();
  };

  // Handle form submission
  const onSubmit = (data: MovieFormValues) => {
    if (editingMovie) {
      updateMovieMutation.mutate({ id: editingMovie.id, movie: data });
    } else {
      addMovieMutation.mutate(data);
    }
  };

  // Filter movies based on search query
  const filteredMovies = movies.filter((movie: any) => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Movies</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search movies..."
                className="pl-10 pr-4 py-2 bg-gray-800 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-amber-600 text-black">
                  <Plus className="mr-2 h-4 w-4" /> Add Movie
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMovie ? "Edit Movie" : "Add New Movie"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="posterUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Poster URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bannerUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="releaseYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Year</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PG-13, R, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="imdbRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IMDb Rating (0-10)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="10" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="genres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genres</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Action, Drama, Comedy, etc." />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of genres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="trailer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trailer URL</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="YouTube URL"
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isNowShowing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Now Showing</FormLabel>
                              <FormDescription>
                                Movie is currently in theaters
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isComingSoon"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Coming Soon</FormLabel>
                              <FormDescription>
                                Movie will be released in the future
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Required for Coming Soon movies
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                        disabled={addMovieMutation.isPending || updateMovieMutation.isPending}
                      >
                        {(addMovieMutation.isPending || updateMovieMutation.isPending) ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          editingMovie ? "Update Movie" : "Add Movie"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
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
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.length > 0 ? (
                    filteredMovies.map((movie: any) => (
                      <TableRow key={movie.id}>
                        <TableCell>{movie.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Film className="h-4 w-4 text-accent" />
                            <span className="font-medium">{movie.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{movie.releaseYear}</TableCell>
                        <TableCell>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {movie.imdbRating?.toFixed(1) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {movie.isNowShowing && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-900 text-green-500 rounded-full mr-1">
                              Now Showing
                            </span>
                          )}
                          {movie.isComingSoon && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-900 text-blue-500 rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMovie(movie)}
                            className="mr-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        {searchQuery ? "No movies found matching your search" : "No movies available"}
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
