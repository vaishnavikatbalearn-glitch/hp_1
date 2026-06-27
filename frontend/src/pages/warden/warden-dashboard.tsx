import { useNavigate } from 'react-router';
import { Home, Users, Bell, Settings, UserCheck, UserX, Clock, AlertCircle, BarChart3, FileText, Shield, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function WardenDashboard() {
  const navigate = useNavigate();

  const stats = {
    totalStudents: 240,
    presentStudents: 218,
    absentStudents: 12,
    studentsOnLeave: 10,
    lateEntries: 5,
    pendingComplaints: 8,
    pendingVisitors: 3,
    pendingLeaveRequests: 6,
    pendingLaundry: 15,
    occupancyRate: 91,
  };

  const recentActivities = [
    { type: 'leave', student: 'Rahul Sharma', action: 'Leave request submitted', time: '5 mins ago' },
    { type: 'complaint', student: 'Priya Singh', action: 'Complaint registered', time: '15 mins ago' },
    { type: 'visitor', student: 'Amit Kumar', action: 'Visitor approval pending', time: '1 hour ago' },
    { type: 'entry', student: 'Neha Patel', action: 'Late entry at 11:45 PM', time: '2 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-6 pt-6 pb-8 rounded-b-[2rem] relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Welcome Back</p>
              <h1 className="text-white text-xl">Warden Dashboard</h1>
            </div>
            <button
              onClick={() => navigate('/warden/notifications')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center relative transition-all backdrop-blur-sm"
            >
              <Bell className="text-white" size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                12
              </span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-white/90 border-0 backdrop-blur-sm">
              <div className="p-3 text-center">
                <p className="text-2xl mb-1">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </Card>
            <Card className="bg-white/90 border-0 backdrop-blur-sm">
              <div className="p-3 text-center">
                <p className="text-2xl mb-1 text-green-600">{stats.presentStudents}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </Card>
            <Card className="bg-white/90 border-0 backdrop-blur-sm">
              <div className="p-3 text-center">
                <p className="text-2xl mb-1 text-red-600">{stats.absentStudents}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </Card>
            <Card className="bg-white/90 border-0 backdrop-blur-sm">
              <div className="p-3 text-center">
                <p className="text-2xl mb-1 text-amber-600">{stats.lateEntries}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-24 px-6 -mt-4">
          {/* Pending Actions */}
          <Card className="bg-card border-border mb-6 shadow-lg">
            <div className="p-4">
              <h3 className="text-base mb-4">Pending Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/warden/leave-approvals')}
                  className="p-3 bg-amber-50 rounded-xl text-left hover:bg-amber-100 transition-colors"
                >
                  <p className="text-2xl mb-1 text-amber-600">{stats.pendingLeaveRequests}</p>
                  <p className="text-xs text-muted-foreground">Leave Requests</p>
                </button>
                <button 
                  onClick={() => navigate('/warden/complaints')}
                  className="p-3 bg-red-50 rounded-xl text-left hover:bg-red-100 transition-colors"
                >
                  <p className="text-2xl mb-1 text-red-600">{stats.pendingComplaints}</p>
                  <p className="text-xs text-muted-foreground">Complaints</p>
                </button>
                <button 
                  onClick={() => navigate('/warden/visitors')}
                  className="p-3 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors"
                >
                  <p className="text-2xl mb-1 text-blue-600">{stats.pendingVisitors}</p>
                  <p className="text-xs text-muted-foreground">Visitors</p>
                </button>
                <button 
                  onClick={() => navigate('/warden/laundry')}
                  className="p-3 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
                >
                  <p className="text-2xl mb-1 text-purple-600">{stats.pendingLaundry}</p>
                  <p className="text-xs text-muted-foreground">Laundry</p>
                </button>
              </div>
            </div>
          </Card>

          {/* Attendance Analytics */}
          <div className="mb-6">
            <h3 className="text-base mb-4">Today's Attendance</h3>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Present Rate</p>
                    <p className="text-3xl">{Math.round((stats.presentStudents / stats.totalStudents) * 100)}%</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <UserCheck className="text-white" size={28} />
                  </div>
                </div>
                <Progress value={(stats.presentStudents / stats.totalStudents) * 100} className="h-2 bg-white/20" />
                <p className="text-white/80 text-xs mt-2">{stats.presentStudents} out of {stats.totalStudents} students</p>
              </div>
            </Card>
          </div>

          {/* Occupancy Analytics */}
          <div className="mb-6">
            <h3 className="text-base mb-4">Hostel Occupancy</h3>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Occupancy Rate</p>
                    <p className="text-3xl">{stats.occupancyRate}%</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Home className="text-white" size={28} />
                  </div>
                </div>
                <Progress value={stats.occupancyRate} className="h-2 bg-white/20" />
                <p className="text-white/80 text-xs mt-2">218 occupied out of 240 beds</p>
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="mb-6">
            <h3 className="text-base mb-4">Recent Activities</h3>
            <Card className="bg-card border-border">
              <div className="divide-y divide-border">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="p-4 flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'leave' ? 'bg-amber-100' :
                      activity.type === 'complaint' ? 'bg-red-100' :
                      activity.type === 'visitor' ? 'bg-blue-100' :
                      'bg-orange-100'
                    }`}>
                      {activity.type === 'leave' ? (
                        <Calendar className="text-amber-600" size={20} />
                      ) : activity.type === 'complaint' ? (
                        <AlertCircle className="text-red-600" size={20} />
                      ) : activity.type === 'visitor' ? (
                        <Users className="text-blue-600" size={20} />
                      ) : (
                        <Clock className="text-orange-600" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">{activity.student}</p>
                      <p className="text-xs text-muted-foreground mb-1">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-base mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/warden/students')}
              >
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="text-primary" size={24} />
                  </div>
                  <p className="text-sm">Student Management</p>
                </div>
              </Card>

              <Card 
                className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/warden/attendance')}
              >
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="text-accent" size={24} />
                  </div>
                  <p className="text-sm">Attendance</p>
                </div>
              </Card>

              <Card 
                className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/warden/rooms')}
              >
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Home className="text-blue-600" size={24} />
                  </div>
                  <p className="text-sm">Room Management</p>
                </div>
              </Card>

              <Card 
                className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/warden/reports')}
              >
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                  <p className="text-sm">Reports</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border py-2 px-4 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around">
              <button className="flex flex-col items-center py-2 px-4 text-accent">
                <Shield size={24} />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button 
                onClick={() => navigate('/warden/students')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground"
              >
                <Users size={24} />
                <span className="text-xs mt-1">Students</span>
              </button>
              <button 
                onClick={() => navigate('/warden/notifications')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground relative"
              >
                <Bell size={24} />
                <span className="text-xs mt-1">Alerts</span>
                <span className="absolute top-1 right-3 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/warden/reports')}
                className="flex flex-col items-center py-2 px-4 text-muted-foreground hover:text-foreground"
              >
                <FileText size={24} />
                <span className="text-xs mt-1">Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
