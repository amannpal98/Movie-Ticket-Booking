import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session and authentication
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      secret: process.env.SESSION_SECRET || "cineticket-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, fullName } = req.body;

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        username,
        password,
        email,
        fullName,
        role: "user",
      });

      // Auto-login after registration
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  });

  // Movie routes
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/now-showing", async (req, res) => {
    try {
      const movies = await storage.getNowShowingMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching now showing movies:", error);
      res.status(500).json({ message: "Failed to fetch now showing movies" });
    }
  });

  app.get("/api/movies/coming-soon", async (req, res) => {
    try {
      const movies = await storage.getComingSoonMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching coming soon movies:", error);
      res.status(500).json({ message: "Failed to fetch coming soon movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  // Admin movie management routes
  app.post("/api/admin/movies", isAdmin, async (req, res) => {
    try {
      const movie = await storage.createMovie(req.body);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.put("/api/admin/movies/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const movie = await storage.updateMovie(id, req.body);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete("/api/admin/movies/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteMovie(id);
      if (!success) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json({ message: "Movie deleted successfully" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  // Cinema routes
  app.get("/api/cinemas", async (req, res) => {
    try {
      const cinemas = await storage.getAllCinemas();
      res.json(cinemas);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      res.status(500).json({ message: "Failed to fetch cinemas" });
    }
  });

  app.get("/api/cinemas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const cinema = await storage.getCinema(id);
      if (!cinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      res.json(cinema);
    } catch (error) {
      console.error("Error fetching cinema:", error);
      res.status(500).json({ message: "Failed to fetch cinema" });
    }
  });

  // Screen routes
  app.get("/api/cinemas/:cinemaId/screens", async (req, res) => {
    try {
      const cinemaId = parseInt(req.params.cinemaId, 10);
      const screens = await storage.getScreensByCinema(cinemaId);
      res.json(screens);
    } catch (error) {
      console.error("Error fetching screens:", error);
      res.status(500).json({ message: "Failed to fetch screens" });
    }
  });

  // Showtime routes
  app.get("/api/movies/:movieId/showtimes", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId, 10);
      const showtimes = await storage.getShowtimesByMovie(movieId);
      
      // Fetch additional data for each showtime
      const showtimesWithDetails = await Promise.all(showtimes.map(async (showtime) => {
        const screen = await storage.getScreen(showtime.screenId);
        const cinema = screen ? await storage.getCinema(screen.cinemaId) : null;
        
        return {
          ...showtime,
          screen,
          cinema
        };
      }));
      
      res.json(showtimesWithDetails);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  app.get("/api/movies/:movieId/showtimes/date/:date", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId, 10);
      const date = new Date(req.params.date);
      
      const showtimes = await storage.getShowtimesByMovieAndDate(movieId, date);
      
      // Fetch additional data for each showtime
      const showtimesWithDetails = await Promise.all(showtimes.map(async (showtime) => {
        const screen = await storage.getScreen(showtime.screenId);
        const cinema = screen ? await storage.getCinema(screen.cinemaId) : null;
        
        return {
          ...showtime,
          screen,
          cinema
        };
      }));
      
      res.json(showtimesWithDetails);
    } catch (error) {
      console.error("Error fetching showtimes by date:", error);
      res.status(500).json({ message: "Failed to fetch showtimes by date" });
    }
  });

  // Booking routes
  app.get("/api/showtimes/:showtimeId/seats", async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.showtimeId, 10);
      const bookedSeats = await storage.getBookedSeatsByShowtime(showtimeId);
      res.json(bookedSeats);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      res.status(500).json({ message: "Failed to fetch booked seats" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const { showtimeId, seats, totalAmount } = req.body;
      const userId = (req.user as any).id;
      
      // Generate a booking reference
      const bookingReference = `CT${Math.floor(Math.random() * 10000000)}`;
      
      // Create the booking
      const booking = await storage.createBooking({
        userId,
        showtimeId,
        totalAmount,
        status: "confirmed",
        bookingReference
      });
      
      // Create booking seats
      for (const seat of seats) {
        await storage.createBookingSeat({
          bookingId: booking.id,
          seatNumber: seat.seatNumber,
          ticketType: seat.ticketType,
          price: seat.price
        });
      }
      
      res.status(201).json({
        booking,
        message: "Booking created successfully"
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const bookings = await storage.getBookingsByUser(userId);
      
      // Fetch additional data for each booking
      const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
        const seats = await storage.getBookingSeatsByBooking(booking.id);
        const showtime = await storage.getShowtime(booking.showtimeId);
        const movie = showtime ? await storage.getMovie(showtime.movieId) : null;
        const screen = showtime ? await storage.getScreen(showtime.screenId) : null;
        const cinema = screen ? await storage.getCinema(screen.cinemaId) : null;
        
        return {
          ...booking,
          seats,
          showtime,
          movie,
          screen,
          cinema
        };
      }));
      
      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the booking belongs to the user or the user is an admin
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      if (booking.userId !== userId && userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const seats = await storage.getBookingSeatsByBooking(booking.id);
      const showtime = await storage.getShowtime(booking.showtimeId);
      const movie = showtime ? await storage.getMovie(showtime.movieId) : null;
      const screen = showtime ? await storage.getScreen(showtime.screenId) : null;
      const cinema = screen ? await storage.getCinema(screen.cinemaId) : null;
      
      res.json({
        ...booking,
        seats,
        showtime,
        movie,
        screen,
        cinema
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Admin routes for bookings
  app.get("/api/admin/bookings", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const allBookings = [];
      
      for (const user of users) {
        const userBookings = await storage.getBookingsByUser(user.id);
        for (const booking of userBookings) {
          const seats = await storage.getBookingSeatsByBooking(booking.id);
          const showtime = await storage.getShowtime(booking.showtimeId);
          const movie = showtime ? await storage.getMovie(showtime.movieId) : null;
          const screen = showtime ? await storage.getScreen(showtime.screenId) : null;
          const cinema = screen ? await storage.getCinema(screen.cinemaId) : null;
          
          allBookings.push({
            ...booking,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName
            },
            seats,
            showtime,
            movie,
            screen,
            cinema
          });
        }
      }
      
      res.json(allBookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Failed to fetch all bookings" });
    }
  });

  app.put("/api/admin/bookings/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json({
        booking,
        message: "Booking status updated successfully"
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
