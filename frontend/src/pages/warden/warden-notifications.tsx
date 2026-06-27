import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, AlertCircle, Users, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getNotifications, markNotificationAsRead, type NotificationItem } from '../../services/api';

export function WardenNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; message: string; time: string; read: boolean }>>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications((data || []).map((item: NotificationItem) => ({
          id: item.id,
          type: item.type || 'general',
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave': return <Calendar className="text-amber-600" size={20} />;
      case 'complaint': return <AlertCircle className="text-red-600" size={20} />;
      case 'visitor': return <Users className="text-blue-600" size={20} />;
      default: return <Bell className="text-purple-600" size={20} />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'leave': return 'bg-amber-100';
      case 'complaint': return 'bg-red-100';
      case 'visitor': return 'bg-blue-100';
      default: return 'bg-purple-100';
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Notifications</h1>{unreadCount > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">{unreadCount} new</span>}</div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id} className={`${n.read ? 'bg-card' : 'bg-secondary/20 border-primary/20'} border-border cursor-pointer`} onClick={() => handleNotificationClick(n.id)}>
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${getBg(n.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm">{n.title}</p>
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
