import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MovieDetails from "@/pages/movie-details";
import BookingIndex from "@/pages/booking/index";
import BookingSeats from "@/pages/booking/seats";
import BookingPayment from "@/pages/booking/payment";
import BookingConfirmation from "@/pages/booking/confirmation";
import AdminDashboard from "@/pages/admin/index";
import AdminMovies from "@/pages/admin/movies";
import AdminShowtimes from "@/pages/admin/showtimes";
import AdminBookings from "@/pages/admin/bookings";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useLocation } from "wouter";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    } else if (!loading && adminOnly && user?.role !== "admin") {
      setLocation("/");
    }
  }, [user, loading, adminOnly, setLocation]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/movies/:id">
        {params => <MovieDetails id={params.id} />}
      </Route>
      <Route path="/booking/:movieId">
        {params => <ProtectedRoute component={() => <BookingIndex movieId={params.movieId} />} />}
      </Route>
      <Route path="/booking/seats">
        {() => <ProtectedRoute component={BookingSeats} />}
      </Route>
      <Route path="/booking/payment">
        {() => <ProtectedRoute component={BookingPayment} />}
      </Route>
      <Route path="/booking/confirmation">
        {() => <ProtectedRoute component={BookingConfirmation} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminOnly={true} />}
      </Route>
      <Route path="/admin/movies">
        {() => <ProtectedRoute component={AdminMovies} adminOnly={true} />}
      </Route>
      <Route path="/admin/showtimes">
        {() => <ProtectedRoute component={AdminShowtimes} adminOnly={true} />}
      </Route>
      <Route path="/admin/bookings">
        {() => <ProtectedRoute component={AdminBookings} adminOnly={true} />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <MainLayout>
        <Router />
      </MainLayout>
    </TooltipProvider>
  );
}

export default App;
