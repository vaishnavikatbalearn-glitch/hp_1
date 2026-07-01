import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Home, Calendar, Bell, User, CheckCircle2, Clock, DollarSign, CalendarCheck, ArrowRight, FileText, Award, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';

export function ParentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['parent-dashboard-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/auth/me');
      const payload = data?.data ?? data ?? {};
      const studentProfile = payload?.studentProfile ?? payload?.profile ?? payload?.student ?? {};
      return {
        name: [payload?.firstName, payload?.lastName].filter(Boolean).join(' ') || studentProfile?.name || payload?.name || 'Student',
        enrollmentNumber: studentProfile?.enrollmentNumber || payload?.enrollmentNumber || payload?.enrollment || '',
        roomNumber: studentProfile?.roomNumber || studentProfile?.room || payload?.roomNumber || payload?.room || '',
        photo: studentProfile?.photo || payload?.photo || '',
        status: payload?.status || 'Present',
      };
    },
    staleTime: 60_000,
  });

  const attendanceQuery = useQuery({
    queryKey: ['parent-dashboard-attendance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/attendance/summary');
      return data?.data ?? data ?? {};
    },
    staleTime: 30_000,
  });

  const leaveQuery = useQuery({
    queryKey: ['parent-dashboard-leave'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/leave/student');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const complaintsQuery = useQuery({
    queryKey: ['parent-dashboard-complaints'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/complaints/my');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const laundryQuery = useQuery({
    queryKey: ['parent-dashboard-laundry'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/laundry');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const visitorsQuery = useQuery({
    queryKey: ['parent-dashboard-visitors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/visitor/student');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const feesQuery = useQuery({
    queryKey: ['parent-dashboard-fees'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/fees/pending');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const notificationsQuery = useQuery({
    queryKey: ['parent-dashboard-notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/v1/notifications');
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 15_000,
  });

  const studentData = profileQuery.data ?? {
    name: 'Student',
    enrollmentNumber: '',
    roomNumber: '',
    photo: '',
    status: 'Present',
  };

  const attendancePercentage = Number(
    attendanceQuery.data?.overallPercentage ?? attendanceQuery.data?.monthly?.percentage ?? attendanceQuery.data?.hostel?.percentage ?? 0,
  );

  const pendingFeeAmount = (feesQuery.data ?? []).reduce((sum, fee: any) => {
    const amount = Number(fee?.amount ?? 0);
    const paid = Number(fee?.paidAmount ?? 0);
    return sum + Math.max(amount - paid, 0);
  }, 0);

  const leaveRequests = leaveQuery.data ?? [];
  const leaveStatus = leaveRequests.length > 0
    ? `Leave ${String(leaveRequests[0]?.status || 'Pending').toLowerCase()}`
    : 'No Active Leave';

  const complaintCount = (complaintsQuery.data ?? []).filter((item: any) => String(item?.status || '').toUpperCase() !== 'RESOLVED').length;
  const complaintStatus = complaintCount > 0 ? `${complaintCount} Pending` : 'No Complaints';

  const laundryStatus = (laundryQuery.data ?? [])[0]?.status ? String((laundryQuery.data ?? [])[0].status).toLowerCase() : 'No Requests';
  const visitorStatus = (visitorsQuery.data ?? [])[0]?.status ? String((visitorsQuery.data ?? [])[0].status).toLowerCase() : 'No Requests';
  const notificationCount = (notificationsQuery.data ?? []).filter((item: any) => !item?.read && !item?.isRead).length;

  const parentDashboard = {
    attendance: attendanceQuery.isLoading ? 'Loading...' : `${attendancePercentage}%`,
    leaveStatus,
    complaintStatus,
    laundryStatus,
    visitorStatus,
    feeStatus: feesQuery.isLoading ? 'Loading...' : `₹${pendingFeeAmount.toLocaleString()}`,
    notificationCount: notificationsQuery.isLoading ? 'Loading...' : String(notificationCount),
  };

  const recentActivities = useMemo(() => {
    const notifications = (notificationsQuery.data ?? []).slice(0, 4).map((item: any) => ({
      type: item?.type === 'leave' ? 'leave' : item?.type === 'fee' ? 'reward' : 'entry',
      time: item?.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Recently updated',
      description: item?.title || item?.body || 'New update received',
    }));

    if (notifications.length) return notifications;
    return [
      { type: 'entry', time: 'Recently updated', description: 'Attendance data synced' },
      { type: 'leave', time: 'Recently updated', description: 'Leave records synced' },
      { type: 'reward', time: 'Recently updated', description: 'Fee records synced' },
    ];
  }, [notificationsQuery.data]);

  const refreshDashboard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-profile'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-attendance'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-leave'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-complaints'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-laundry'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-visitors'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-fees'] }),
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard-notifications'] }),
    ]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-6 pt-6 pb-24 rounded-b-[2rem] relative">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-xl">Parent Dashboard</h1>
            <button
              onClick={() => navigate('/parent/notifications')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center relative transition-all backdrop-blur-sm"
            >
              <Bell className="text-white" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
          </div>

          {/* Student Info Card */}
          <Card className="bg-white border-0 shadow-xl">
            <div className="p-5">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16 border-2 border-secondary">
                  <AvatarImage src={studentData.photo} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg mb-1">{studentData.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{studentData.enrollmentNumber}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Room:</span>
                      <span className="text-foreground">{studentData.roomNumber}</span>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 size={12} className="mr-1" />
                      {studentData.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="px-6 -mt-16 mb-6 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/attendance')}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CalendarCheck className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-2xl mb-1">{parentDashboard.attendance}</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/fees-tracking')}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-amber-600" size={20} />
                  </div>
                </div>
                <p className="text-2xl mb-1">{parentDashboard.feeStatus}</p>
                <p className="text-xs text-muted-foreground">Pending Fees</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/leave-tracking')}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-sm mb-1">{parentDashboard.leaveStatus}</p>
                <p className="text-xs text-muted-foreground">Leave Status</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/notifications')}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Bell className="text-red-600" size={20} />
                  </div>
                </div>
                <p className="text-2xl mb-1">{parentDashboard.notificationCount}</p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base">Recent Activities</h3>
            <button 
              onClick={() => navigate('/parent/movement-history')}
              className="text-primary text-sm flex items-center"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <Card className="bg-card border-border">
            <div className="divide-y divide-border">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-4 flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'entry' ? 'bg-blue-100' :
                    activity.type === 'leave' ? 'bg-amber-100' :
                    'bg-green-100'
                  }`}>
                    {activity.type === 'entry' ? (
                      <Clock className={`${
                        activity.description.includes('Exit') ? 'text-orange-600' : 'text-blue-600'
                      }`} size={20} />
                    ) : activity.type === 'leave' ? (
                      <Calendar className="text-amber-600" size={20} />
                    ) : (
                      <Award className="text-green-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Visitor Requests */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base">Visitor Requests</h3>
            <button onClick={() => void refreshDashboard()} className="text-primary text-sm">Refresh</button>
          </div>

          <Card className="bg-card border-border">
            <div className="px-4 pt-3 text-xs text-muted-foreground">
              Visitor: {parentDashboard.visitorStatus} • Complaint: {parentDashboard.complaintStatus} • Laundry: {parentDashboard.laundryStatus}
            </div>
            <div className="divide-y divide-border">
              {(visitorsQuery.data ?? []).length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No visitor requests found.</div>
              ) : (
                (visitorsQuery.data ?? []).map((visitor: any, index: number) => (
                  <div key={visitor.id || index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{visitor.visitorName}</p>
                      <Badge className={visitor.status && visitor.status.toLowerCase() === 'approved' ? 'bg-green-500 text-white' : visitor.status && visitor.status.toLowerCase() === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                        {visitor.status || 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Purpose: {visitor.purpose}</p>
                    <p className="text-xs text-muted-foreground">Visit Date: {visitor.expectedDate ? new Date(visitor.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="px-6 mb-24">
          <h3 className="text-base mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/attendance')}
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck className="text-primary" size={24} />
                </div>
                <p className="text-sm">View Attendance</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/fees-tracking')}
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Receipt className="text-accent" size={24} />
                </div>
                <p className="text-sm">View Fees</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/notice-board')}
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <p className="text-sm">Notice Board</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/parent/student-overview')}
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <User className="text-purple-600" size={24} />
                </div>
                <p className="text-sm">Student Profile</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border py-2 px-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around">
              <button className="flex flex-col items-center py-2 px-4 text-primary">
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button 
                onClick={() => navigate('/parent/attendance')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground"
              >
                <Calendar size={24} />
                <span className="text-xs mt-1">Attendance</span>
              </button>
              <button 
                onClick={() => navigate('/parent/notifications')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground relative"
              >
                <Bell size={24} />
                <span className="text-xs mt-1">Alerts</span>
                <span className="absolute top-1 right-3 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/parent/settings')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground"
              >
                <User size={24} />
                <span className="text-xs mt-1">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
