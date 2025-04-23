
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  
  // Mock authentication status - in a real app, this would be handled by context/state management
  const isAuthenticated = false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Mock logout - would be handled by auth service in a real app
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-worklink-700">WorkLink</span>
            <span className="bg-worklink-700 text-white px-1 rounded text-sm">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link to="/" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/' ? 'font-medium text-worklink-600' : ''}`}>
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/feed" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/feed' ? 'font-medium text-worklink-600' : ''}`}>
                    Feed
                  </Link>
                  <Link to="/jobs" className={`text-gray-600 hover:text-worklink-600 ${location.pathname.startsWith('/jobs') ? 'font-medium text-worklink-600' : ''}`}>
                    Jobs
                  </Link>
                  <Link to="/cover-letter" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/cover-letter' ? 'font-medium text-worklink-600' : ''}`}>
                    Cover Letter
                  </Link>
                </>
              ) : (
                <Link to="/features" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/features' ? 'font-medium text-worklink-600' : ''}`}>
                  Features
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <div className="w-8 h-8 rounded-full bg-worklink-100 flex items-center justify-center text-worklink-700 font-semibold border border-worklink-200">
                      U
                    </div>
                  </Link>
                  <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} size="sm">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 pb-6 border-t animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/feed" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/feed' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Feed
                  </Link>
                  <Link to="/jobs" className={`text-gray-600 hover:text-worklink-600 ${location.pathname.startsWith('/jobs') ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Jobs
                  </Link>
                  <Link to="/cover-letter" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/cover-letter' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Cover Letter
                  </Link>
                  <Link to="/profile" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/profile' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Profile
                  </Link>
                  <Button variant="ghost" onClick={() => { handleLogout(); toggleMenu(); }} className="justify-start px-0">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/features" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/features' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Features
                  </Link>
                  <Link to="/login" className={`text-gray-600 hover:text-worklink-600 ${location.pathname === '/login' ? 'font-medium text-worklink-600' : ''}`} onClick={toggleMenu}>
                    Log in
                  </Link>
                  <Link to="/signup" onClick={toggleMenu}>
                    <Button>Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
