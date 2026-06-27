import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Bell } from 'lucide-react';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  backTo?: string;
  showNotificationBell?: boolean;
  notificationCount?: number;
  headerActions?: ReactNode;
}

export function MobileLayout({
  children,
  title,
  backTo,
  showNotificationBell = false,
  notificationCount = 0,
  headerActions,
}: MobileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isParentPortal = location.pathname.startsWith('/parent');
  const notificationPath = isParentPortal ? '/parent/notifications' : '/warden/notifications';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {backTo && (
                <button
                  onClick={() => navigate(backTo)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <ArrowLeft className="text-white" size={20} />
                </button>
              )}
              <h1 className="text-white text-lg truncate max-w-[200px]">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {headerActions}
              {showNotificationBell && (
                <button
                  onClick={() => navigate(notificationPath)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center relative transition-all backdrop-blur-sm"
                >
                  <Bell className="text-white" size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
