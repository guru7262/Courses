import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ExternalLink } from "lucide-react";
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
  // Extended fields for detailed view
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">Check back later for updates and announcements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Notification List */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50">
                  <h2 className="font-semibold text-foreground">All Notifications</h2>
                </div>
                <div className="divide-y divide-border max-h-[calc(100vh-200px)] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 transition-colors hover:bg-accent/50 ${
                        selectedNotification?.id === notification.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.bannerImage ? (
                          <img
                            src={notification.bannerImage}
                            alt={notification.title}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                        ) : notification.icon ? (
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                            {notification.icon}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Bell className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm mb-1 line-clamp-2 ${getTypeColor(notification.type)}`}>
                            {notification.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Detailed View */}
            <div className="lg:col-span-2">
              {selectedNotification && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  {/* Banner Image */}
                  {selectedNotification.bannerImage && (
                    <div className="w-full h-48 md:h-64 overflow-hidden bg-muted">
                      <img
                        src={selectedNotification.bannerImage}
                        alt={selectedNotification.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(selectedNotification.type)}`}>
                        {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {selectedNotification.icon && (
                        <span className="mr-2">{selectedNotification.icon}</span>
                      )}
                      {selectedNotification.title}
                    </h2>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                      <span>
                        {new Date(selectedNotification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {selectedNotification.metadata?.author && (
                        <span>By {selectedNotification.metadata.author}</span>
                      )}
                      {selectedNotification.metadata?.category && (
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {selectedNotification.metadata.category}
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <div className="mb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedNotification.message}
                      </p>
                    </div>

                    {/* Read More Section */}
                    {selectedNotification.fullContent && (
                      <div className="mb-6">
                        {!showFullContent ? (
                          <Button
                            onClick={() => setShowFullContent(true)}
                            variant="outline"
                            className="w-full md:w-auto"
                          >
                            Read More
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {selectedNotification.fullContent}
                              </div>
                            </div>
                            <Button
                              onClick={() => setShowFullContent(false)}
                              variant="ghost"
                              size="sm"
                            >
                              Show Less
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Link */}
                    {selectedNotification.link && (
                      <div className="pt-6 border-t border-border">
                        <a
                          href={selectedNotification.link}
                          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                          target={selectedNotification.link.startsWith('http') ? '_blank' : '_self'}
                          rel={selectedNotification.link.startsWith('http') ? 'noopener noreferrer' : ''}
                        >
                          {selectedNotification.linkText || 'Learn More'}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedNotification.metadata?.tags && selectedNotification.metadata.tags.length > 0 && (
                      <div className="pt-6 border-t border-border mt-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedNotification.metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}