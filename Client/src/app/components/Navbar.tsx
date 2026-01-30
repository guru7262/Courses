import { useState, useEffect } from "react";
import { Menu, X, User, Home, BookOpen, Video, ClipboardList, ChevronDown, Mail, Github, Linkedin, Youtube, Moon, Sun } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "@/app/components/ThemeProvider";
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
  const [showMobileExplore, setShowMobileExplore] = useState(false);
  const [showMobileQuickAccess, setShowMobileQuickAccess] = useState(true);
  const [showMobileContact, setShowMobileContact] = useState(false);
  const [activeContentType, setActiveContentType] = useState<string | null>(null);
  const exploreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contactTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedContentType = localStorage.getItem('selectedContentType');
    setActiveContentType(storedContentType);
  }, [location]);

  const handleNavigateToContentType = (contentType: string) => {
    localStorage.setItem('selectedContentType', contentType);
    setActiveContentType(contentType);
    navigate('/');
    setShowMobileMenu(false);
  };

  const handleClearContentType = () => {
    localStorage.removeItem('selectedContentType');
    setActiveContentType(null);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background border-border shadow-sm">
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
          <Link to="/" onClick={handleClearContentType}>
            <Button 
              variant="ghost" 
              className={`gap-2 ${location.pathname === '/' && !activeContentType ? 'bg-accent text-accent-foreground' : 'text-foreground'}`}
            >
              Home
            </Button>
          </Link>

          {/* EXPLORE - Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
              setShowExploreMenu(true);
            }}
            onMouseLeave={() => {
              exploreTimeoutRef.current = setTimeout(() => setShowExploreMenu(false), 150);
            }}
          >
            <Button variant="ghost" className="gap-2 text-foreground">
              Explore
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showExploreMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-popover border-border text-popover-foreground shadow-lg py-1">
                <Link 
                  to="/"
                  onClick={handleClearContentType}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  12th Standard
                </Link>
              </div>
            )}
          </div>

          {/* NOTES */}
          <Button 
            variant="ghost" 
            className={`gap-2 ${activeContentType === 'notes' ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}`}
            onClick={() => handleNavigateToContentType('notes')}
          >
            Notes
          </Button>

          {/* VIDEOS */}
          <Button 
            variant="ghost" 
            className={`gap-2 ${activeContentType === 'videoLectures' ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}`}
            onClick={() => handleNavigateToContentType('videoLectures')}
          >
            Videos
          </Button>

          {/* MOCK TESTS */}
          <Button 
            variant="ghost" 
            className={`gap-2 ${activeContentType === 'mockTests' ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}`}
            onClick={() => handleNavigateToContentType('mockTests')}
          >
            Mock Tests
          </Button>

          {/* CONTACT - Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
              setShowContactMenu(true);
            }}
            onMouseLeave={() => {
              contactTimeoutRef.current = setTimeout(() => setShowContactMenu(false), 150);
            }}
          >
            <Button variant="ghost" className="gap-2 text-foreground">
              Contact
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showContactMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border bg-popover border-border text-popover-foreground shadow-lg py-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Youtube className="h-4 w-4 text-destructive" />
                  </div>
                  YouTube
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Github className="h-4 w-4 text-foreground" />
                  </div>
                  GitHub
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Linkedin className="h-4 w-4 text-primary" />
                  </div>
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right section - Profile + Mobile Menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-foreground">
            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <User className="h-5 w-5" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 z-20 overflow-hidden rounded-lg border bg-popover border-border text-popover-foreground shadow-lg">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                  <div className="p-1">
                    <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors">
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button onClick={toggleTheme} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors">
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
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
        <div className="md:hidden border-t border-border bg-background text-foreground overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="flex flex-col p-4 gap-2">
            {/* HOME */}
            <Link to="/" onClick={() => { handleClearContentType(); setShowMobileMenu(false); }}>
              <Button variant="ghost" className={`w-full justify-start gap-2 ${location.pathname === '/' && !activeContentType ? 'bg-accent text-accent-foreground' : ''}`}>
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>

            {/* EXPLORE - Expandable */}
            <div className="border-t border-border pt-2">
              <button 
                onClick={() => setShowMobileExplore(!showMobileExplore)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                EXPLORE
                <ChevronDown className={`h-3 w-3 transition-transform ${showMobileExplore ? "rotate-180" : ""}`} />
              </button>
              {showMobileExplore && (
                <div className="pl-4 space-y-1 mt-1">
                  <Link to="/" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-sm hover:bg-accent rounded-md">
                    12th Standard
                  </Link>
                </div>
              )}
            </div>

            {/* QUICK ACCESS (Notes, Videos, etc.) ... */}
<div className="border-t border-border pt-2">
              <button 
                onClick={() => setShowMobileQuickAccess(!showMobileQuickAccess)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                Quick Access <ChevronDown className={`h-3 w-3 transition-transform ${showMobileQuickAccess ? "rotate-180" : ""}`} />
              </button>
              {showMobileQuickAccess && (
                <div className="pl-2 mt-1 space-y-1">
                  <Button variant="ghost" className={`w-full justify-start gap-3 ${activeContentType === 'notes' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => handleNavigateToContentType('notes')}>
                    <BookOpen className="h-4 w-4" /> Notes
                  </Button>
                  <Button variant="ghost" className={`w-full justify-start gap-3 ${activeContentType === 'videoLectures' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => handleNavigateToContentType('videoLectures')}>
                    <Video className="h-4 w-4" /> Videos
                  </Button>
                  <Button variant="ghost" className={`w-full justify-start gap-3 ${activeContentType === 'mockTests' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => handleNavigateToContentType('mockTests')}>
                    <ClipboardList className="h-4 w-4" /> Mock Tests
                  </Button>
                </div>
              )}
            </div>
            {/* CONTACT - Expandable */}
            <div className="border-t border-border pt-2">
              <button 
                onClick={() => setShowMobileContact(!showMobileContact)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                CONTACT
                <ChevronDown className={`h-3 w-3 transition-transform ${showMobileContact ? "rotate-180" : ""}`} />
              </button>
              
              {showMobileContact && (
                <div className="pl-2 space-y-1 mt-1">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Youtube className="h-4 w-4 text-destructive" />
                    </div>
                    YouTube
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Github className="h-4 w-4 text-foreground" />
                    </div>
                    GitHub
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Linkedin className="h-4 w-4 text-primary" />
                    </div>
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}