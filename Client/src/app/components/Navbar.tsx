import { useState } from "react";
import { Menu, X, User, Home, BookOpen, Video, ClipboardList, ChevronDown, Mail, Github, Linkedin, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { useRef } from "react";

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const exploreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const contactTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  const handleNavigateToContentType = (contentType: string) => {
    // For now, just navigate to home. Later this will open subjects and redirect to specific content type
    navigate('/');
    setShowMobileMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left section - Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            EduLearn
          </Link>
        </div>

        {/* Center section - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {/* HOME */}
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              Home
            </Button>
          </Link>

          {/* EXPLORE - Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => {
    if (exploreTimeoutRef.current) {
      clearTimeout(exploreTimeoutRef.current);
    }
    setShowExploreMenu(true);
  }}
  onMouseLeave={() => {
    exploreTimeoutRef.current = setTimeout(() => {
      setShowExploreMenu(false);
    }, 150); // 👈 delay in ms
  }}
          >
            <Button variant="ghost" className="gap-2">
              Explore
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showExploreMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-white shadow-lg py-1">
                <Link 
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                >
                  12th Standard
                </Link>
                {/* More categories can be added here later */}
              </div>
            )}
          </div>

          {/* NOTES */}
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => handleNavigateToContentType('notes')}
          >
     
            Notes
          </Button>

          {/* VIDEOS */}
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => handleNavigateToContentType('videos')}
          >
          
            Videos
          </Button>

          {/* MOCK TESTS */}
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => handleNavigateToContentType('mockTests')}
          >
      
            Mock Tests
          </Button>

          {/* CONTACT - Dropdown */}
          <div 
            className="relative"
             onMouseEnter={() => {
    if (contactTimeoutRef.current) {
      clearTimeout(contactTimeoutRef.current);
    }
    setShowContactMenu(true);
  }}
  onMouseLeave={() => {
    contactTimeoutRef.current = setTimeout(() => {
      setShowContactMenu(false);
    }, 150);
  }}
          >
            <Button variant="ghost" className="gap-2">
              Contact
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showContactMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border bg-white shadow-lg py-2">
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Youtube className="h-4 w-4 text-red-600" />
                  </div>
                  YouTube
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Github className="h-4 w-4 text-gray-800" />
                  </div>
                  GitHub
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                  </div>
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right section - Profile + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden"
          >
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 transition-opacity"
            >
              <User className="h-5 w-5 text-white" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                {/* Dropdown Card */}
                <div className="absolute right-0 top-full mt-2 w-48 z-20 overflow-hidden rounded-lg border bg-white shadow-lg">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">john@example.com</p>
                  </div>
                  <div className="p-1">
                    <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100 transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <X className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col p-4 gap-2">
            {/* HOME */}
            <Link to="/" onClick={() => setShowMobileMenu(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>

            {/* EXPLORE */}
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-500 px-3 mb-2">EXPLORE</p>
              <Link to="/" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  12th Standard
                </Button>
              </Link>
            </div>

            {/* QUICK ACCESS */}
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-500 px-3 mb-2">QUICK ACCESS</p>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleNavigateToContentType('notes')}
              >
                <BookOpen className="h-4 w-4" />
                Notes
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleNavigateToContentType('videos')}
              >
                <Video className="h-4 w-4" />
                Videos
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={() => handleNavigateToContentType('mockTests')}
              >
                <ClipboardList className="h-4 w-4" />
                Mock Tests
              </Button>
            </div>

            {/* CONTACT */}
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-gray-500 px-3 mb-2">CONTACT</p>
              <a 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Youtube className="h-4 w-4 text-red-600" />
                </div>
                YouTube
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Github className="h-4 w-4 text-gray-800" />
                </div>
                GitHub
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                </div>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}