import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Phone, Mail, MapPin, User, GraduationCap, Home, Calendar, Award, DollarSign, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WardenStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const student = {
    name: 'Rahul Sharma',
    enrollment: '2021CSE045',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    course: 'B.Tech Computer Science',
    semester: '6th Semester',
    room: 'A-204',
    status: 'Present',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@email.com',
    parentName: 'Mr. Rajesh Sharma',
    parentPhone: '+91 98765 12345',
    attendance: 94,
    totalFees: 85000,
    paidFees: 72500,
    pendingFees: 12500,
  };

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
                  <AvatarImage src={student.photo} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg mb-1">{student.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{student.enrollment}</p>
                  <Badge className="bg-green-500 text-white">
                    {student.status}
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
                          <p className="text-sm">{student.email}</p>
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
                          <p className="text-sm">{student.room}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4">
                      <h4 className="text-sm mb-3">Attendance</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{student.attendance}%</span>
                        <Badge className="bg-green-500 text-white">Excellent</Badge>
                      </div>
                      <Progress value={student.attendance} className="h-2" />
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4">
                      <h4 className="text-sm mb-3">Fee Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Fees</span>
                          <span>₹{student.totalFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paid</span>
                          <span className="text-green-600">₹{student.paidFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pending</span>
                          <span className="text-amber-600">₹{student.pendingFees.toLocaleString()}</span>
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
                          <p className="text-sm">{student.course}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Semester</span>
                          <span className="text-sm">{student.semester}</span>
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
                          <p className="text-sm">{student.parentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Phone className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact</p>
                          <p className="text-sm">{student.parentPhone}</p>
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
