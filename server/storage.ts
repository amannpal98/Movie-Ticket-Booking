import { 
  users, type User, type InsertUser,
  movies, type Movie, type InsertMovie,
  cinemas, type Cinema, type InsertCinema,
  screens, type Screen, type InsertScreen,
  showtimes, type Showtime, type InsertShowtime,
  bookings, type Booking, type InsertBooking,
  bookingSeats, type BookingSeat, type InsertBookingSeat
} from "@shared/schema";
import { nanoid } from "nanoid";

// Storage interface for CRUD operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Movies
  getMovie(id: number): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  getNowShowingMovies(): Promise<Movie[]>;
  getComingSoonMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;

  // Cinemas
  getCinema(id: number): Promise<Cinema | undefined>;
  getAllCinemas(): Promise<Cinema[]>;
  createCinema(cinema: InsertCinema): Promise<Cinema>;

  // Screens
  getScreen(id: number): Promise<Screen | undefined>;
  getScreensByCinema(cinemaId: number): Promise<Screen[]>;
  createScreen(screen: InsertScreen): Promise<Screen>;

  // Showtimes
  getShowtime(id: number): Promise<Showtime | undefined>;
  getShowtimesByMovie(movieId: number): Promise<Showtime[]>;
  getShowtimesByScreen(screenId: number): Promise<Showtime[]>;
  getShowtimesByMovieAndDate(movieId: number, date: Date): Promise<Showtime[]>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Booking Seats
  getBookingSeatsByBooking(bookingId: number): Promise<BookingSeat[]>;
  createBookingSeat(seat: InsertBookingSeat): Promise<BookingSeat>;
  getBookedSeatsByShowtime(showtimeId: number): Promise<BookingSeat[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private cinemas: Map<number, Cinema>;
  private screens: Map<number, Screen>;
  private showtimes: Map<number, Showtime>;
  private bookings: Map<number, Booking>;
  private bookingSeats: Map<number, BookingSeat>;
  
  private currentIds: {
    users: number;
    movies: number;
    cinemas: number;
    screens: number;
    showtimes: number;
    bookings: number;
    bookingSeats: number;
  };

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.cinemas = new Map();
    this.screens = new Map();
    this.showtimes = new Map();
    this.bookings = new Map();
    this.bookingSeats = new Map();
    
    this.currentIds = {
      users: 1,
      movies: 1,
      cinemas: 1,
      screens: 1,
      showtimes: 1,
      bookings: 1,
      bookingSeats: 1,
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Movies
  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getNowShowingMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(
      (movie) => movie.isNowShowing
    );
  }

  async getComingSoonMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(
      (movie) => movie.isComingSoon
    );
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.currentIds.movies++;
    const movie: Movie = { ...insertMovie, id };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existingMovie = this.movies.get(id);
    if (!existingMovie) return undefined;
    
    const updatedMovie = { ...existingMovie, ...movie };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    return this.movies.delete(id);
  }

  // Cinemas
  async getCinema(id: number): Promise<Cinema | undefined> {
    return this.cinemas.get(id);
  }

  async getAllCinemas(): Promise<Cinema[]> {
    return Array.from(this.cinemas.values());
  }

  async createCinema(insertCinema: InsertCinema): Promise<Cinema> {
    const id = this.currentIds.cinemas++;
    const cinema: Cinema = { ...insertCinema, id };
    this.cinemas.set(id, cinema);
    return cinema;
  }

  // Screens
  async getScreen(id: number): Promise<Screen | undefined> {
    return this.screens.get(id);
  }

  async getScreensByCinema(cinemaId: number): Promise<Screen[]> {
    return Array.from(this.screens.values()).filter(
      (screen) => screen.cinemaId === cinemaId
    );
  }

  async createScreen(insertScreen: InsertScreen): Promise<Screen> {
    const id = this.currentIds.screens++;
    const screen: Screen = { ...insertScreen, id };
    this.screens.set(id, screen);
    return screen;
  }

  // Showtimes
  async getShowtime(id: number): Promise<Showtime | undefined> {
    return this.showtimes.get(id);
  }

  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    return Array.from(this.showtimes.values()).filter(
      (showtime) => showtime.movieId === movieId
    );
  }

  async getShowtimesByScreen(screenId: number): Promise<Showtime[]> {
    return Array.from(this.showtimes.values()).filter(
      (showtime) => showtime.screenId === screenId
    );
  }

  async getShowtimesByMovieAndDate(movieId: number, date: Date): Promise<Showtime[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return Array.from(this.showtimes.values()).filter(
      (showtime) => {
        const showtimeDate = new Date(showtime.startTime);
        return showtime.movieId === movieId && 
               showtimeDate >= targetDate && 
               showtimeDate < nextDay;
      }
    );
  }

  async createShowtime(insertShowtime: InsertShowtime): Promise<Showtime> {
    const id = this.currentIds.showtimes++;
    const showtime: Showtime = { ...insertShowtime, id };
    this.showtimes.set(id, showtime);
    return showtime;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.bookingReference === reference
    );
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentIds.bookings++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Booking Seats
  async getBookingSeatsByBooking(bookingId: number): Promise<BookingSeat[]> {
    return Array.from(this.bookingSeats.values()).filter(
      (seat) => seat.bookingId === bookingId
    );
  }

  async createBookingSeat(insertSeat: InsertBookingSeat): Promise<BookingSeat> {
    const id = this.currentIds.bookingSeats++;
    const seat: BookingSeat = { ...insertSeat, id };
    this.bookingSeats.set(id, seat);
    return seat;
  }

  async getBookedSeatsByShowtime(showtimeId: number): Promise<BookingSeat[]> {
    // First get all bookings for this showtime
    const showtimeBookings = Array.from(this.bookings.values()).filter(
      booking => {
        const showtime = this.showtimes.get(booking.showtimeId);
        return showtime && showtime.id === showtimeId && booking.status !== 'cancelled';
      }
    );
    
    // Then get all seats for these bookings
    const bookedSeats: BookingSeat[] = [];
    for (const booking of showtimeBookings) {
      const seats = await this.getBookingSeatsByBooking(booking.id);
      bookedSeats.push(...seats);
    }
    
    return bookedSeats;
  }

  private initializeSampleData() {
    // Sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@cineticket.com",
      fullName: "Admin User",
      role: "admin"
    });

    // Sample regular user
    this.createUser({
      username: "user",
      password: "user123",
      email: "user@example.com",
      fullName: "Test User",
      role: "user"
    });

    // Sample movies
    const movies = [
      {
        title: "Dune: Part Two",
        description: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
        posterUrl: "https://m.media-amazon.com/images/I/71oUZDOOITL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        releaseYear: 2024,
        duration: 166,
        rating: "PG-13",
        imdbRating: 8.8,
        genres: ["Action", "Adventure", "Sci-Fi"],
        trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
        isNowShowing: true,
        isComingSoon: false
      },
      {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
        posterUrl: "https://m.media-amazon.com/images/I/71NnFJKC-LL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        releaseYear: 2022,
        duration: 176,
        rating: "PG-13",
        imdbRating: 8.4,
        genres: ["Action", "Crime", "Drama"],
        trailer: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
        isNowShowing: true,
        isComingSoon: false
      },
      {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        posterUrl: "https://m.media-amazon.com/images/I/71xDtUSyAKL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        releaseYear: 2023,
        duration: 180,
        rating: "R",
        imdbRating: 7.9,
        genres: ["Biography", "Drama", "History"],
        trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        isNowShowing: true,
        isComingSoon: false
      },
      {
        title: "Poor Things",
        description: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
        posterUrl: "https://m.media-amazon.com/images/I/71DTUcAyvTL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        releaseYear: 2023,
        duration: 141,
        rating: "R",
        imdbRating: 7.6,
        genres: ["Comedy", "Drama", "Romance"],
        trailer: "https://www.youtube.com/watch?v=RlbR5N6veqw",
        isNowShowing: true,
        isComingSoon: false
      },
      {
        title: "Challengers",
        description: "Follows three players who knew each other when they were teenagers as they compete in a tennis tournament to be the world-famous grand slam winner.",
        posterUrl: "https://m.media-amazon.com/images/I/71DEPg+ixNL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1512070679279-8988d32161be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        releaseYear: 2024,
        duration: 131,
        rating: "R",
        imdbRating: 8.2,
        genres: ["Drama", "Romance", "Sport"],
        trailer: "https://www.youtube.com/watch?v=2c9RYjpGWG0",
        isNowShowing: true,
        isComingSoon: false
      },
      {
        title: "The Fall Guy",
        description: "A stuntman is recruited for a dangerous mission by his ex-girlfriend and boss to find a missing movie star.",
        posterUrl: "https://m.media-amazon.com/images/I/81kZHFcWQxL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        releaseYear: 2024,
        duration: 126,
        rating: "PG-13",
        imdbRating: 7.5,
        genres: ["Action", "Comedy"],
        trailer: "https://www.youtube.com/watch?v=QH9UDLOus9A",
        isNowShowing: false,
        isComingSoon: true,
        releaseDate: new Date("2024-05-24")
      },
      {
        title: "Inside Out 2",
        description: "Follow Riley as a teenager as she encounters new emotions.",
        posterUrl: "https://m.media-amazon.com/images/I/71zH6YOi3qL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        releaseYear: 2024,
        duration: 105,
        rating: "PG",
        imdbRating: 8.5,
        genres: ["Animation", "Comedy", "Family"],
        trailer: "https://www.youtube.com/watch?v=4-7cY5VCf8U",
        isNowShowing: false,
        isComingSoon: true,
        releaseDate: new Date("2024-06-07")
      },
      {
        title: "Deadpool & Wolverine",
        description: "Wade Wilson aka Deadpool facing a life crisis teams up with Wolverine whose return to the MCU has been widely anticipated by fans.",
        posterUrl: "https://m.media-amazon.com/images/I/71b6YZC-TBL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1568111561564-08726a1563e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        releaseYear: 2024,
        duration: 120,
        rating: "R",
        imdbRating: 8.7,
        genres: ["Action", "Comedy", "Sci-Fi"],
        trailer: "https://www.youtube.com/watch?v=4mLnx7jlZYc",
        isNowShowing: false,
        isComingSoon: true,
        releaseDate: new Date("2024-07-12")
      },
      {
        title: "Alien: Romulus",
        description: "The ninth film in the Alien franchise takes place between the events of Alien and Aliens, following a group of young people on a distant world who find themselves confronting the most terrifying life form in the universe.",
        posterUrl: "https://m.media-amazon.com/images/I/71w14CInwWL._AC_UF894,1000_QL80_.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        releaseYear: 2024,
        duration: 115,
        rating: "R",
        imdbRating: 8.1,
        genres: ["Horror", "Sci-Fi", "Thriller"],
        trailer: "https://www.youtube.com/watch?v=kBHDMqQCFBo",
        isNowShowing: false,
        isComingSoon: true,
        releaseDate: new Date("2024-08-08")
      }
    ];

    for (const movie of movies) {
      this.createMovie(movie);
    }

    // Sample cinemas
    const cinemas = [
      {
        name: "CineTicket Downtown",
        address: "123 Main Street, Downtown",
        city: "New York, NY 10001",
        imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        reviewCount: 120
      },
      {
        name: "CineTicket Central",
        address: "456 Park Avenue, Midtown",
        city: "New York, NY 10022",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        reviewCount: 95
      },
      {
        name: "CineTicket Uptown",
        address: "789 Broadway, Uptown",
        city: "New York, NY 10025",
        imageUrl: "https://images.unsplash.com/photo-1594067598377-478c61d59f3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        reviewCount: 150
      }
    ];

    const cinemaInstances: Cinema[] = [];
    for (const cinema of cinemas) {
      const createdCinema = this.createCinema(cinema);
      cinemaInstances.push(createdCinema);
    }

    // After creating cinemas, create screens for each
    const createScreensForCinema = async (cinema: Cinema) => {
      // Create screens for this cinema
      const screen1 = await this.createScreen({
        cinemaId: cinema.id,
        name: "Screen 1",
        totalSeats: 120,
        seatLayout: {
          rows: 10,
          seatsPerRow: 12,
          rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        }
      });

      const screen2 = await this.createScreen({
        cinemaId: cinema.id,
        name: "Screen 2",
        totalSeats: 80,
        seatLayout: {
          rows: 8,
          seatsPerRow: 10,
          rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
        }
      });

      return [screen1, screen2];
    };

    // Create screens and showtimes
    (async () => {
      for (const cinema of cinemaInstances) {
        const screens = await createScreensForCinema(cinema);
        
        // Create showtimes for the first 5 movies (now showing) for each screen
        for (let movieId = 1; movieId <= 5; movieId++) {
          for (const screen of screens) {
            // Create multiple showtimes per day for the next 7 days
            for (let day = 0; day < 7; day++) {
              const showtimesForDay = [
                new Date(new Date().setDate(new Date().getDate() + day)),
                new Date(new Date().setDate(new Date().getDate() + day)),
                new Date(new Date().setDate(new Date().getDate() + day)),
                new Date(new Date().setDate(new Date().getDate() + day))
              ];
              
              showtimesForDay[0].setHours(10, 30, 0, 0);
              showtimesForDay[1].setHours(13, 15, 0, 0);
              showtimesForDay[2].setHours(16, 0, 0, 0);
              showtimesForDay[3].setHours(19, 30, 0, 0);
              
              for (const startTime of showtimesForDay) {
                const movie = await this.getMovie(movieId);
                if (movie) {
                  const endTime = new Date(startTime);
                  endTime.setMinutes(endTime.getMinutes() + movie.duration);
                  
                  await this.createShowtime({
                    movieId,
                    screenId: screen.id,
                    startTime,
                    endTime,
                    price: 1499 // $14.99
                  });
                }
              }
            }
          }
        }
      }
    })();
  }
}

export const storage = new MemStorage();
