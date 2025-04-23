import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube, Apple, Play } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary py-8 mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-accent font-poppins">Cine<span className="text-white">Ticket</span></span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">Experience movies like never before with our premium booking service. Find the best seats at the best prices.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#movies" className="text-gray-400 hover:text-accent transition-colors">Movies</a></li>
              <li><a href="#cinemas" className="text-gray-400 hover:text-accent transition-colors">Cinemas</a></li>
              <li><a href="#offers" className="text-gray-400 hover:text-accent transition-colors">Offers & Promos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Gift Cards</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Corporate Bookings</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Download Our App</h3>
            <p className="text-gray-400 text-sm mb-4">Get the most out of your movie experience with our mobile app.</p>
            <div className="flex flex-col space-y-2">
              <a href="#" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors">
                <Apple className="mr-2" size={20} />
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="font-medium">App Store</div>
                </div>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors">
                <Play className="mr-2" size={20} />
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="font-medium">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CineTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
