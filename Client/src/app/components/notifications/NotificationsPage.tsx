import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  link?: string;
  linkText?: string;
  createdAt: string;
  bannerImage?: string;
  fullContent?: string;
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
  };
}

interface NotificationsPageProps {
  apiUrl: string;
}

export function NotificationsPage({ apiUrl }: NotificationsPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const notificationId = searchParams.get('id');
    if (notificationId && notifications.length > 0) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        setSelectedNotification(notification);
        setShowFullContent(false);
      }
    } else if (notifications.length > 0 && !selectedNotification) {
      setSelectedNotification(notifications[0]);
    }
  }, [searchParams, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowFullContent(false);
    navigate(`/notifications?id=${notification.id}`, { replace: true });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'announcement': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'announcement': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background w-full">
        <div className="p-4 border-b"><Skeleton className="h-8 w-32" /></div>
        <div className="flex h-[calc(100vh-60px)]">
          <Skeleton className="w-16 lg:w-1/3 h-full rounded-none" />
          <Skeleton className="flex-1 h-full rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card relative z-30">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-card">
        
        {/* LEFT PANEL */}
        <div 
          className={`
            relative flex flex-col border-r border-border bg-muted/10 transition-all duration-300 ease-in-out z-20
            ${isSidebarExpanded ? 'w-[60vw] lg:w-1/3' : 'w-16 lg:w-1/3'}
          `}
        >
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="lg:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-30 bg-primary text-primary-foreground rounded-full p-1 shadow-lg"
          >
            {isSidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="flex-1 overflow-y-auto divide-y divide-border flex flex-col">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left transition-colors hover:bg-accent/50 group ${
  selectedNotification?.id === notification.id 
    ? 'bg-accent border-r-4 border-primary border-b-transparent' // Added border-b-transparent
    : 'border-b border-border' // Moved border-b here
} ${isSidebarExpanded ? 'p-0 h-28' : 'p-4 flex items-center justify-center min-h-[60px]'}`}
              >
                {/* DESKTOP & MOBILE EXPANDED VIEW */}
                <div className={`w-full h-full ${isSidebarExpanded ? 'flex flex-row' : 'hidden lg:flex lg:flex-row lg:items-start lg:gap-4'}`}>
                  {/* Left Side: Image/Icon */}
                  <div className={`${isSidebarExpanded ? 'w-1/2' : 'w-20'} h-full bg-muted overflow-hidden shrink-0`}>
                    {notification.bannerImage ? (
                      <img src={notification.bannerImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/20">
                         <span className="text-2xl">{notification.icon || "🔔"}</span>
                      </div>
                    )}
                  </div>
                  {/* Right Side: Info */}
                  <div className={`flex-1 p-3 flex flex-col justify-start overflow-hidden pt-2`}>
                    <h3 className={`font-bold text-sm lg:text-base mb-1 line-clamp-1 ${getTypeColor(notification.type)}`}>
                      {notification.title}
                    </h3>
                    <p className="text-[10px] lg:text-sm text-muted-foreground line-clamp-2 leading-tight">
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* MOBILE COLLAPSED VIEW: Horizontal single word */}
                {!isSidebarExpanded && (
                  <div className="lg:hidden w-full flex justify-center items-center overflow-hidden">
                    <span className="text-[11px] font-bold text-muted-foreground/80 truncate">
                      {notification.title.split(' ')[0]}..
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Detailed Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          {selectedNotification ? (
            <div className="animate-in fade-in duration-300">
              {selectedNotification.bannerImage && (
                <img
                  src={selectedNotification.bannerImage}
                  alt=""
                  className="w-full h-48 md:h-80 object-cover border-b"
                />
              )}
              
              <div className="p-6 md:p-12 max-w-4xl mx-auto">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${getTypeBadge(selectedNotification.type)}`}>
                  {selectedNotification.type}
                </span>
                
                <h2 className="text-2xl md:text-5xl font-black mb-4 tracking-tight leading-tight flex items-center gap-3">
                  <span className="shrink-0">{selectedNotification.icon || "🔔"}</span>
                  {selectedNotification.title}
                </h2>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 border-b pb-6">
                   <span>{new Date(selectedNotification.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                </div>

                <div className="text-base md:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap mb-8">
                  {showFullContent && selectedNotification.fullContent 
                    ? selectedNotification.fullContent 
                    : selectedNotification.message}
                </div>

                {selectedNotification.fullContent && (
                  <Button variant="secondary" onClick={() => setShowFullContent(!showFullContent)} className="rounded-full px-6">
                    {showFullContent ? "Show Less" : "Read Full Update"}
                  </Button>
                )}

                {selectedNotification.link && (
                  <div className="mt-12 pt-8 border-t">
                    <a href={selectedNotification.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-primary hover:underline font-bold text-lg">
                      {selectedNotification.linkText || 'Learn More'}
                      <ExternalLink size={20} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Bell size={64} />
                <p className="mt-4 font-medium">Select a notification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}