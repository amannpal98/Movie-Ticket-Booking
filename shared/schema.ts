import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Movie Table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  posterUrl: text("poster_url").notNull(),
  bannerUrl: text("banner_url").notNull(),
  releaseYear: integer("release_year").notNull(),
  duration: integer("duration").notNull(), // in minutes
  rating: text("rating").notNull(), // PG, PG-13, R, etc.
  imdbRating: real("imdb_rating"), // out of 10
  genres: jsonb("genres").notNull().$type<string[]>(),
  trailer: text("trailer"),
  isNowShowing: boolean("is_now_showing").notNull().default(true),
  isComingSoon: boolean("is_coming_soon").notNull().default(false),
  releaseDate: timestamp("release_date"), // for coming soon movies
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  description: true,
  posterUrl: true,
  bannerUrl: true,
  releaseYear: true,
  duration: true,
  rating: true,
  imdbRating: true,
  genres: true,
  trailer: true,
  isNowShowing: true,
  isComingSoon: true,
  releaseDate: true,
});

// Cinema Table
export const cinemas = pgTable("cinemas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
});

export const insertCinemaSchema = createInsertSchema(cinemas).pick({
  name: true,
  address: true,
  city: true,
  imageUrl: true,
  rating: true,
  reviewCount: true,
});

// Screens within a Cinema
export const screens = pgTable("screens", {
  id: serial("id").primaryKey(),
  cinemaId: integer("cinema_id").notNull().references(() => cinemas.id),
  name: text("name").notNull(), // e.g., Screen 1, Screen 2, etc.
  totalSeats: integer("total_seats").notNull(),
  seatLayout: jsonb("seat_layout").notNull(), // JSON configuration of the seat layout
});

export const insertScreenSchema = createInsertSchema(screens).pick({
  cinemaId: true,
  name: true,
  totalSeats: true,
  seatLayout: true,
});

// Showtimes
export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => movies.id),
  screenId: integer("screen_id").notNull().references(() => screens.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: integer("price").notNull(), // in cents
});

export const insertShowtimeSchema = createInsertSchema(showtimes).pick({
  movieId: true,
  screenId: true,
  startTime: true,
  endTime: true,
  price: true,
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  showtimeId: integer("showtime_id").notNull().references(() => showtimes.id),
  totalAmount: integer("total_amount").notNull(), // in cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("confirmed"), // 'confirmed', 'cancelled', 'pending'
  bookingReference: text("booking_reference").notNull().unique(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  showtimeId: true,
  totalAmount: true,
  status: true,
  bookingReference: true,
});

// Booking Seats
export const bookingSeats = pgTable("booking_seats", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  seatNumber: text("seat_number").notNull(), // e.g., A1, B2, etc.
  ticketType: text("ticket_type").notNull(), // e.g., Adult, Child, Senior
  price: integer("price").notNull(), // in cents
});

export const insertBookingSeatSchema = createInsertSchema(bookingSeats).pick({
  bookingId: true,
  seatNumber: true,
  ticketType: true,
  price: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type Cinema = typeof cinemas.$inferSelect;
export type InsertCinema = z.infer<typeof insertCinemaSchema>;

export type Screen = typeof screens.$inferSelect;
export type InsertScreen = z.infer<typeof insertScreenSchema>;

export type Showtime = typeof showtimes.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingSeat = typeof bookingSeats.$inferSelect;
export type InsertBookingSeat = z.infer<typeof insertBookingSeatSchema>;
