import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, Filter, Plus, UserCheck, UserX, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getStudents } from '../../services/api';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';

type StudentStatus = 'Present' | 'Absent' | 'On Leave' | 'Late Entry';

interface StudentWithStatus {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  course: string;
  branch: string;
  photoUrl?: string;
  status: StudentStatus;
  roomNumber?: string;
}

export function WardenStudentManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const studentsQuery = useQuery({
    queryKey: ['students-list'],
    queryFn: () => getStudents(),
  });

  const attendanceQuery = useQuery({
    queryKey: ['attendance-today'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/attendance/today');
      return response.data?.data || [];
    },
  });

  const roomAllocationsQuery = useQuery({
    queryKey: ['room-allocations'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/rooms');
      return response.data?.data || [];
    },
  });

  const students = useMemo<StudentWithStatus[]>(() => {
    if (!studentsQuery.data) return [];

    const attendanceMap = new Map((attendanceQuery.data || []).map((a: any) => [
      a.studentId,
      a.status,
    ]));

    const roomMap = new Map(
      (roomAllocationsQuery.data || [])
        .flatMap((room: any) => room.allocations || [])
        .map((alloc: any) => [alloc.studentId, alloc.roomNumber])
    );

    return studentsQuery.data.map((student: any) => {
      const attendanceStatus = attendanceMap.get(student.id);
      let status: StudentStatus = 'Present';
      
      if (attendanceStatus === 'ABSENT') {
        status = 'Absent';
      } else if (attendanceStatus === 'ON_LEAVE') {
        status = 'On Leave';
      } else if (attendanceStatus === 'LATE') {
        status = 'Late Entry';
      }

      return {
        id: student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        enrollmentNumber: student.enrollmentNumber,
        course: `${student.branch} ${student.year}`,
        branch: student.branch,
        photoUrl: student.photoUrl,
        status,
        roomNumber: roomMap.get(student.id),
      };
    });
  }, [studentsQuery.data, attendanceQuery.data, roomAllocationsQuery.data]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      present: students.filter((s) => s.status === 'Present').length,
      absent: students.filter((s) => s.status === 'Absent').length,
      onLeave: students.filter((s) => s.status === 'On Leave').length,
    };
  }, [students]);

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case 'Present':
        return 'bg-green-500';
      case 'Absent':
        return 'bg-red-500';
      case 'On Leave':
        return 'bg-blue-500';
      case 'Late Entry':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: StudentStatus) => {
    switch (status) {
      case 'Present':
        return <UserCheck size={12} />;
      case 'Absent':
        return <UserX size={12} />;
      case 'Late Entry':
        return <Clock size={12} />;
      default:
        return null;
    }
  };

  const displayStudents = studentsQuery.isPending ? [] : filteredStudents;
  const isLoading = studentsQuery.isPending || attendanceQuery.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => navigate('/warden')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Student Management</h1>
          </div>

          {/* Search & Filter */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
              />
            </div>
            <Button className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm">
              <Filter className="text-white" size={18} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Summary */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-4 gap-2 mb-6">
              <Card className="bg-white border-border">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-green-600">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-red-600">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-blue-600">{stats.onLeave}</p>
                  <p className="text-xs text-muted-foreground">Leave</p>
                </div>
              </Card>
            </div>

            {/* Add Student Button */}
            <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-6">
              <Plus size={18} className="mr-2" />
              Add New Student
            </Button>

            {/* Student List */}
            <div className="space-y-3">
              {isLoading ? (
                <Card className="bg-card border-border">
                  <div className="p-4 text-center text-muted-foreground">
                    Loading students...
                  </div>
                </Card>
              ) : displayStudents.length === 0 ? (
                <Card className="bg-card border-border">
                  <div className="p-4 text-center text-muted-foreground">
                    No students found
                  </div>
                </Card>
              ) : (
                displayStudents.map((student) => (
                  <Card 
                    key={student.id} 
                    className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/warden/students/${student.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-secondary">
                          <AvatarImage src={student.photoUrl} />
                          <AvatarFallback>
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm">{student.firstName} {student.lastName}</h4>
                            <Badge className={`${getStatusColor(student.status)} text-white text-xs flex items-center space-x-1`}>
                              {getStatusIcon(student.status)}
                              <span>{student.status}</span>
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{student.enrollmentNumber}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{student.course}</span>
                            <span>•</span>
                            <span>{student.roomNumber ? `Room ${student.roomNumber}` : 'No Room'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

