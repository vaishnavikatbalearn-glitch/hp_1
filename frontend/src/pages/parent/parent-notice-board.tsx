import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Pin, Bell, Calendar, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNotices, type NoticeRecord } from '../../services/api';

export function ParentNoticeBoard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotices();
        setNotices(Array.isArray(data) ? data : []);
      } catch {
        setNotices([]);
      }
    };

    void load();
  }, []);

  const { pinnedNotices, regularNotices } = useMemo(() => {
    const pinned = notices.filter((n) => Boolean(n.isPinned));
    const regular = notices.filter((n) => !Boolean(n.isPinned));
    return { pinnedNotices: pinned, regularNotices: regular };
  }, [notices]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Important':
        return 'bg-red-500';
      case 'Event':
        return 'bg-purple-500';
      case 'Emergency':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Important':
        return <Bell size={12} />;
      case 'Event':
        return <Calendar size={12} />;
      case 'Emergency':
        return <AlertTriangle size={12} />;
      default:
        return <Bell size={12} />;
    }
  };

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
            <h1 className="text-white text-lg">Digital Notice Board</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Pinned Notices */}
          {pinnedNotices.length > 0 && (
            <div className="px-6 py-6">
              <div className="flex items-center space-x-2 mb-4">
                <Pin className="text-primary" size={18} />
                <h3 className="text-base">Pinned Notices</h3>
              </div>
              <div className="space-y-3">
                {pinnedNotices.map((notice) => (
                  <Card key={notice.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Pin className="text-amber-600" size={16} />
                          <h4 className="text-sm">{notice.title}</h4>
                        </div>
                        <Badge className={`${getCategoryColor(notice.category)} text-white text-xs flex items-center space-x-1`}>
                          {getCategoryIcon(notice.category)}
                          <span>{notice.category}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                      <p className="text-xs text-muted-foreground">{notice.createdAt || notice.updatedAt ? (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(notice.updatedAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })) : '—'}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Notices */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">All Notices</h3>
            <div className="space-y-3">
              {regularNotices.map((notice) => (
                <Card key={notice.id} className="bg-card border-border">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm">{notice.title}</h4>
                      <Badge className={`${getCategoryColor(notice.category)} text-white text-xs flex items-center space-x-1 flex-shrink-0 ml-2`}>
                        {getCategoryIcon(notice.category)}
                        <span>{notice.category}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">{notice.createdAt || notice.updatedAt ? (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(notice.updatedAt || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })) : '—'}</p>
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
