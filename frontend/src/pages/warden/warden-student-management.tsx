import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Filter, Plus, UserCheck, UserX, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function WardenStudentManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    { id: '1', name: 'Rahul Sharma', enrollment: '2021CSE045', course: 'B.Tech CSE', room: 'A-204', status: 'Present', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { id: '2', name: 'Priya Singh', enrollment: '2021ECE032', course: 'B.Tech ECE', room: 'B-105', status: 'Present', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
    { id: '3', name: 'Amit Kumar', enrollment: '2021ME018', course: 'B.Tech ME', room: 'A-301', status: 'On Leave', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    { id: '4', name: 'Neha Patel', enrollment: '2021IT027', course: 'B.Tech IT', room: 'B-203', status: 'Present', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    { id: '5', name: 'Rohan Desai', enrollment: '2021CSE051', course: 'B.Tech CSE', room: 'A-102', status: 'Late Entry', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' },
    { id: '6', name: 'Ananya Reddy', enrollment: '2021ECE041', course: 'B.Tech ECE', room: 'B-307', status: 'Absent', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
  ];

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
                  <p className="text-xl mb-1">240</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-green-600">218</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-red-600">12</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-3 text-center">
                  <p className="text-xl mb-1 text-blue-600">10</p>
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
              {students.map((student) => (
                <Card 
                  key={student.id} 
                  className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/warden/students/${student.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 border-2 border-secondary">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm">{student.name}</h4>
                          <Badge className={`${getStatusColor(student.status)} text-white text-xs flex items-center space-x-1`}>
                            {getStatusIcon(student.status)}
                            <span>{student.status}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{student.enrollment}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{student.course}</span>
                          <span>•</span>
                          <span>Room {student.room}</span>
                        </div>
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
