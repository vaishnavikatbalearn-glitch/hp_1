import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, GraduationCap, Home, Calendar, Award, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { api } from '../../services/api';

interface StudentProfileData {
  name: string;
  enrollmentNumber: string;
  photo: string;
  department: string;
  semester: string;
  year: string;
  roomNumber: string;
  floorNumber: string;
  blockName: string;
  phone: string;
  email: string;
  guardian: string;
  attendancePercentage: number;
  totalPresent: number;
  totalAbsent: number;
  totalLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  achievements: string[];
}

export function ParentStudentOverview() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentProfileData>({
    name: "",
    enrollmentNumber: "",
    photo: "",
    department: "",
    semester: "",
    year: "",
    roomNumber: "",
    floorNumber: "",
    blockName: "",
    phone: "",
    email: "",
    guardian: "",
    attendancePercentage: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    achievements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const payload = await api.get('/auth/me') as any;
        const data = payload?.data ?? payload;
        const profile = data?.studentProfile ?? data?.profile ?? data?.student ?? {};
        const name = [data?.firstName, data?.lastName].filter(Boolean).join(' ') || profile?.name || data?.name || 'Student';

        if (isMounted) {
          setStudentData({
            name,
            enrollmentNumber: data?.enrollmentNumber || profile?.enrollmentNumber || data?.enrollment || profile?.enrollment || '',
            photo: data?.photo || profile?.photo || '',
            department: profile?.department || profile?.branch || profile?.major || data?.department || data?.branch || '',
            semester: profile?.semester || data?.semester || '',
            year: profile?.year || profile?.academicYear || data?.year || '',
            roomNumber: profile?.roomNumber || profile?.room || profile?.roomNo || data?.roomNumber || data?.room || '',
            floorNumber: profile?.floorNumber || profile?.floor || data?.floorNumber || data?.floor || '',
            blockName: profile?.blockName || profile?.block || data?.blockName || data?.block || '',
            phone: data?.phone || profile?.phone || profile?.mobile || data?.mobile || '',
            email: data?.email || profile?.email || '',
            guardian: profile?.guardianName || profile?.parentName || data?.guardianName || data?.parentName || '',
            attendancePercentage: Number(profile?.attendancePercentage ?? data?.attendancePercentage ?? 0),
            totalPresent: Number(profile?.totalPresent ?? data?.totalPresent ?? 0),
            totalAbsent: Number(profile?.totalAbsent ?? data?.totalAbsent ?? 0),
            totalLeaves: Number(profile?.totalLeaves ?? data?.totalLeaves ?? 0),
            approvedLeaves: Number(profile?.approvedLeaves ?? data?.approvedLeaves ?? 0),
            rejectedLeaves: Number(profile?.rejectedLeaves ?? data?.rejectedLeaves ?? 0),
            totalFees: Number(profile?.totalFees ?? data?.totalFees ?? 0),
            paidFees: Number(profile?.paidFees ?? data?.paidFees ?? 0),
            pendingFees: Number(profile?.pendingFees ?? data?.pendingFees ?? 0),
            achievements: Array.isArray(profile?.achievements) ? profile.achievements : Array.isArray(data?.achievements) ? data.achievements : [],
          });
        }
      } catch {
        if (isMounted) {
          setStudentData((prev) => ({ ...prev, name: 'Student', enrollmentNumber: '', department: '', year: '', roomNumber: '', phone: '', email: '', guardian: '' }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 pb-20 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Student Overview</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-6 -mt-12 mb-6 relative z-10">
          <Card className="bg-card border-border shadow-xl">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-secondary">
                  <AvatarImage src={studentData.photo} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg mb-1">{loading ? 'Loading...' : studentData.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{loading ? 'Loading profile...' : studentData.enrollmentNumber || '—'}</p>
                  <Badge className="bg-primary text-white">Active Student</Badge>
                  {!loading && (
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>Room: {studentData.roomNumber || '—'}</p>
                      <p>Department: {studentData.department || '—'}</p>
                      <p>Year: {studentData.year || '—'}</p>
                      <p>Phone: {studentData.phone || '—'}</p>
                      <p>Email: {studentData.email || '—'}</p>
                      <p>Guardian: {studentData.guardian || '—'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Academic Information */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Academic Information</h3>
            <Card className="bg-card border-border">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <GraduationCap className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm">{loading ? 'Loading...' : studentData.department || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Semester</p>
                    <p className="text-sm">{loading ? 'Loading...' : studentData.semester || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="text-sm">{loading ? 'Loading...' : studentData.year || '—'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Room Information */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Room Information</h3>
            <Card className="bg-card border-border">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Home className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room Number</p>
                    <p className="text-sm">{loading ? 'Loading...' : studentData.roomNumber || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-sm">{loading ? 'Loading...' : studentData.floorNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Block</p>
                    <p className="text-sm">{loading ? 'Loading...' : studentData.blockName || '—'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Attendance Summary */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Attendance Summary</h3>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Overall Attendance</p>
                    <p className="text-3xl">{studentData.attendancePercentage}%</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="text-white" size={28} />
                  </div>
                </div>
                <Progress value={studentData.attendancePercentage} className="h-2 bg-white/20 mb-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/80 text-xs">Present Days</p>
                    <p className="text-lg">{studentData.totalPresent}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs">Absent Days</p>
                    <p className="text-lg">{studentData.totalAbsent}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Leave Summary */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Leave Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1">{studentData.totalLeaves}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1 text-green-600">{studentData.approvedLeaves}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1 text-red-600">{studentData.rejectedLeaves}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Fee Summary</h3>
            <Card className="bg-card border-border">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Fees</p>
                    <p className="text-base">₹{studentData.totalFees.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Paid</p>
                    <p className="text-sm text-green-600">₹{studentData.paidFees.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                    <p className="text-sm text-amber-600">₹{studentData.pendingFees.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Achievements */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Achievements</h3>
            <div className="space-y-2">
              {studentData.achievements.map((achievement, index) => (
                <Card key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <div className="p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="text-white" size={16} />
                    </div>
                    <p className="text-sm">{achievement}</p>
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
