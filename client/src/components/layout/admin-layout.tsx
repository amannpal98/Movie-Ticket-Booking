import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  LayoutDashboard, 
  Film, 
  Calendar, 
  CreditCard, 
  Users, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { 
      label: 'Dashboard', 
      href: '/admin', 
      icon: <LayoutDashboard className="w-5 mr-2" />,
      active: location === '/admin'
    },
    { 
      label: 'Movies', 
      href: '/admin/movies', 
      icon: <Film className="w-5 mr-2" />,
      active: location === '/admin/movies'
    },
    { 
      label: 'Showtimes', 
      href: '/admin/showtimes', 
      icon: <Calendar className="w-5 mr-2" />,
      active: location === '/admin/showtimes'
    },
    { 
      label: 'Bookings', 
      href: '/admin/bookings', 
      icon: <CreditCard className="w-5 mr-2" />,
      active: location === '/admin/bookings'
    },
    { 
      label: 'Users', 
      href: '/admin/users', 
      icon: <Users className="w-5 mr-2" />,
      active: location === '/admin/users'
    },
    { 
      label: 'Settings', 
      href: '/admin/settings', 
      icon: <Settings className="w-5 mr-2" />,
      active: location === '/admin/settings'
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access this page.</p>
          <Link href="/">
            <Button variant="secondary">Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-sidebar fixed inset-y-0 z-40 flex-shrink-0 flex flex-col transition-transform duration-200 ease-in-out",
          "md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-black mr-3">
              <Settings size={20} />
            </div>
            <div>
              <div className="font-bold text-sidebar-foreground">Admin Panel</div>
              <div className="text-xs text-gray-400">{user.fullName}</div>
            </div>
          </div>

          <nav>
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        item.active 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Link href="/">
            <a className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Website
            </a>
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-grow md:ml-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
