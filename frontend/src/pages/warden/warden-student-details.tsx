import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin, User, GraduationCap, Home, Calendar, Award, DollarSign, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudentById, getFeeDetails, getStudents } from '../../services/api';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';

export function WardenStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const studentQuery = useQuery({
    queryKey: ['student-details', id],
    queryFn: () => (id ? getStudentById(id) : Promise.reject('No student ID')),
    enabled: !!id,
  });

  const attendanceQuery = useQuery({
    queryKey: ['student-attendance', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/v1/attendance/student/${id}`);
      return response.data?.data || [];
    },
    enabled: !!id,
  });

  const feesQuery = useQuery({
    queryKey: ['student-fees', id],
    queryFn: () => (id ? getFeeDetails(id) : Promise.reject('No student ID')),
    enabled: !!id,
  });

  const parentsQuery = useQuery({
    queryKey: ['all-students-for-parents', id],
    queryFn: async () => {
      const students = await getStudents();
      return students.find((s: any) => s.id === id);
    },
    enabled: !!id,
  });

  const student = studentQuery.data;
  const attendanceRecords = (attendanceQuery.data || []) as any[];
  const feeRecords = feesQuery.data || [];

  const calculateAttendance = () => {
    if (attendanceRecords.length === 0) return 0;
    const presentCount = attendanceRecords.filter(
      (a) => a.status === 'PRESENT'
    ).length;
    return Math.round((presentCount / attendanceRecords.length) * 100);
  };

  const calculateFees = () => {
    let totalFees = 0;
    let paidAmount = 0;

    feeRecords.forEach((fee: any) => {
      totalFees += Number(fee.amount || 0);
      paidAmount += Number(fee.paidAmount || 0);
    });

    return {
      totalFees,
      paidAmount,
      pendingFees: totalFees - paidAmount,
    };
  };

  const fees = calculateFees();
  const attendance = calculateAttendance();

  if (studentQuery.isPending) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </div>
    );
  }

  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = `${student.firstName[0]}${student.lastName[0]}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 pb-20 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/warden/students')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
              <h1 className="text-white text-lg">Student Details</h1>
            </div>
            <Button 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => navigate(`/warden/face-enrollment/${id}`)}
            >
              <Camera size={16} className="mr-1" />
              Face ID
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-6 -mt-12 mb-6 relative z-10">
          <Card className="bg-card border-border shadow-xl">
            <div className="p-5">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-secondary">
                  <AvatarImage src={student.photoUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg mb-1">{fullName}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{student.enrollmentNumber}</p>
                  <Badge className="bg-green-500 text-white">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          <div className="px-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="parent">Parent</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info">
                <div className="space-y-4">
                  <Card className="bg-card border-border">
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm mb-3">Contact Information</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Phone className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Mail className="text-purple-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm">{student.city || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm mb-3">Room Information</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Home className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Room Number</p>
                          <p className="text-sm">TBD</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4">
                      <h4 className="text-sm mb-3">Attendance</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{attendance}%</span>
                        <Badge className={attendance >= 75 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                          {attendance >= 75 ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                      <Progress value={attendance} className="h-2" />
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4">
                      <h4 className="text-sm mb-3">Fee Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Fees</span>
                          <span>₹{fees.totalFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paid</span>
                          <span className="text-green-600">₹{fees.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pending</span>
                          <span className="text-amber-600">₹{fees.pendingFees.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Academic Tab */}
              <TabsContent value="academic">
                <div className="space-y-4">
                  <Card className="bg-card border-border">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <GraduationCap className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Course</p>
                          <p className="text-sm">{student.branch || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Year</span>
                          <span className="text-sm">{student.year} Year</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Parent Tab */}
              <TabsContent value="parent">
                <div className="space-y-4">
                  <Card className="bg-card border-border">
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm mb-3">Parent Information</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <User className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Parent Name</p>
                          <p className="text-sm">Contact Admin</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Phone className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact</p>
                          <p className="text-sm">{student.emergencyPhone}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => navigate(`/warden/parent-photo-view/${id}`)}
                  >
                    View Parent Photo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
