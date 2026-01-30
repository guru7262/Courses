import { useState, useEffect } from "react";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  link?: string;
  linkText?: string;
}

interface NotificationBannerProps {
  apiUrl: string;
}

export function NotificationBanner({ apiUrl }: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    const dismissed = localStorage.getItem('dismissedBannerNotifications');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedBannerNotifications', JSON.stringify(newDismissed));
  };

  // Only show high priority notifications that haven't been dismissed
  const bannerNotifications = notifications.filter(
    n => n.priority === 'high' && !dismissedIds.includes(n.id)
  );

  if (bannerNotifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'announcement': return <Megaphone className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getBannerStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'announcement':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      {bannerNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`border-b ${getBannerStyle(notification.type)} transition-all`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {notification.icon ? (
                  <span className="text-2xl">{notification.icon}</span>
                ) : (
                  getIcon(notification.type)
                )}
                
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base">
                    {notification.title}
                  </p>
                  <p className="text-xs md:text-sm opacity-90">
                    {notification.message}
                  </p>
                </div>

                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-sm font-medium hover:underline whitespace-nowrap hidden md:block"
                  >
                    {notification.linkText || 'Learn more'} →
                  </a>
                )}
              </div>

              <button
                onClick={() => handleDismiss(notification.id)}
                className="hover:opacity-70 transition-opacity flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {notification.link && (
              <a
                href={notification.link}
                className="text-sm font-medium hover:underline mt-2 inline-block md:hidden"
              >
                {notification.linkText || 'Learn more'} →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}