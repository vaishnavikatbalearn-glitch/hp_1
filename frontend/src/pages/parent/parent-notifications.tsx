import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, CheckCircle2, XCircle, AlertCircle, DollarSign, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNotifications, markNotificationAsRead, type NotificationItem } from '../../services/api';

export function ParentNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; message: string; time: string; read: boolean }>>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications((data || []).map((item: NotificationItem) => ({
          id: item.id,
          type: item.type || 'notice',
          title: item.title,
          message: item.body,
          time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''),
          read: Boolean(item.read ?? item.isRead ?? false),
        })));
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    } catch {
      // keep existing UI behavior if the request fails
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'leave':
        return <AlertCircle className="text-blue-600" size={20} />;
      case 'fees':
        return <DollarSign className="text-amber-600" size={20} />;
      case 'emergency':
        return <AlertTriangle className="text-red-600" size={20} />;
      default:
        return <Info className="text-purple-600" size={20} />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'bg-green-100';
      case 'leave':
        return 'bg-blue-100';
      case 'fees':
        return 'bg-amber-100';
      case 'emergency':
        return 'bg-red-100';
      default:
        return 'bg-purple-100';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-white text-primary">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          <div className="px-6 py-6">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${
                    notification.read ? 'bg-card' : 'bg-secondary/20 border-primary/20'
                  } border-border cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${getNotificationBg(notification.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
