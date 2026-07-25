import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin, User, GraduationCap, Home, Calendar, Award, DollarSign, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getStudentById,
  getFeeDetails,
  updateStudent,
  getStudentParents,
  linkStudentParent,
  getRooms,
  assignRoom,
  changeRoom,
  type RoomRecord,
  type StudentParentRelation,
  type StudentRecord,
} from '../../services/api';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';

export function WardenStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<StudentRecord>>({});
  const [parentIdToLink, setParentIdToLink] = useState('');
  const [parentIsPrimary, setParentIsPrimary] = useState(false);
  const [parentStatusMessage, setParentStatusMessage] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomMessage, setRoomMessage] = useState<string | null>(null);

  const studentQuery = useQuery({
    queryKey: ['student-details', id],
    queryFn: () => (id ? getStudentById(id) : Promise.reject('No student ID')),
    enabled: !!id,
  });

  useEffect(() => {
    if (studentQuery.data) {
      setProfileForm({
        firstName: studentQuery.data.firstName,
        lastName: studentQuery.data.lastName,
        phone: studentQuery.data.phone,
        emergencyPhone: studentQuery.data.emergencyPhone,
        address: studentQuery.data.address,
        city: studentQuery.data.city,
        state: studentQuery.data.state,
        pinCode: studentQuery.data.pinCode,
        branch: studentQuery.data.branch,
        course: studentQuery.data.course,
        year: studentQuery.data.year,
      });
    }
  }, [studentQuery.data]);

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

  const studentParentsQuery = useQuery({
    queryKey: ['student-parents', id],
    queryFn: () => (id ? getStudentParents(id) : Promise.reject('No student ID')),
    enabled: !!id,
  });

  const roomsQuery = useQuery({
    queryKey: ['rooms-list'],
    queryFn: () => getRooms(),
    staleTime: 30_000,
  });

  const student = studentQuery.data;
  const attendanceRecords = (attendanceQuery.data || []) as any[];
  const feeRecords = feesQuery.data || [];

  const updateStudentMutation = useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: Partial<StudentRecord> }) =>
      updateStudent(studentId, payload),
    onSuccess: async () => {
      setStatusMessage('Profile updated successfully.');
      setIsEditing(false);
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ['student-details', id] });
      }
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    },
  });

  const assignRoomMutation = useMutation({
    mutationFn: ({ studentId, roomId }: { studentId: string; roomId: string }) =>
      assignRoom(studentId, roomId),
    onSuccess: async () => {
      setRoomMessage('Room assigned successfully.');
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ['student-details', id] });
      }
      await queryClient.invalidateQueries({ queryKey: ['rooms-list'] });
    },
    onError: (error) => {
      setRoomMessage(error instanceof Error ? error.message : 'Unable to assign room.');
    },
  });

  const changeRoomMutation = useMutation({
    mutationFn: ({ studentId, newRoomId }: { studentId: string; newRoomId: string }) =>
      changeRoom(studentId, newRoomId),
    onSuccess: async () => {
      setRoomMessage('Room changed successfully.');
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ['student-details', id] });
      }
      await queryClient.invalidateQueries({ queryKey: ['rooms-list'] });
    },
    onError: (error) => {
      setRoomMessage(error instanceof Error ? error.message : 'Unable to change room.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ studentId, isActive }: { studentId: string; isActive: boolean }) =>
      updateStudent(studentId, { isActive }),
    onSuccess: async () => {
      setStatusMessage('Student status updated successfully.');
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ['student-details', id] });
      }
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update status.');
    },
  });

  const linkParentMutation = useMutation({
    mutationFn: ({ studentId, parentId, isPrimary }: { studentId: string; parentId: string; isPrimary: boolean }) =>
      linkStudentParent(studentId, { parentId, isPrimary }),
    onSuccess: async () => {
      setParentStatusMessage('Parent linked successfully.');
      setParentIdToLink('');
      setParentIsPrimary(false);
      if (id) {
        await queryClient.invalidateQueries({ queryKey: ['student-parents', id] });
        await queryClient.invalidateQueries({ queryKey: ['student-details', id] });
      }
    },
    onError: (error) => {
      setParentStatusMessage(error instanceof Error ? error.message : 'Unable to link parent.');
    },
  });

  const calculateAttendance = () => {
    if (attendanceRecords.length === 0) return 0;
    const presentCount = attendanceRecords.filter(
      (a) => a.status === 'PRESENT'
    ).length;
    return Math.round((presentCount / attendanceRecords.length) * 100);
  };

  const availableRooms = (roomsQuery.data ?? []).filter((room) => room.currentOccupancy < room.capacity);
  const currentRoomNumber = student?.roomNumber || student?.room || '';
  const currentRoom = (roomsQuery.data ?? []).find(
    (room) => room.id === student?.roomId || room.roomNumber === currentRoomNumber,
  );

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

  const handleRoomSubmit = () => {
    if (!id || !selectedRoomId) return;
    setRoomMessage(null);
    if (currentRoomNumber) {
      changeRoomMutation.mutate({ studentId: id, newRoomId: selectedRoomId });
    } else {
      assignRoomMutation.mutate({ studentId: id, roomId: selectedRoomId });
    }
  };

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
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate(`/warden/face-enrollment/${id}`)}
              >
                <Camera size={16} className="mr-1" />
                Face ID
              </Button>
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => {
                  setIsEditing((current) => !current);
                  setStatusMessage(null);
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                size="sm"
                className={student?.isActive ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                onClick={() => {
                  if (!id) return;
                  toggleActiveMutation.mutate({ studentId: id, isActive: !student?.isActive });
                  setStatusMessage(null);
                }}
                disabled={!id || toggleActiveMutation.isLoading}
              >
                {student?.isActive ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
          {statusMessage ? (
            <div className="mt-3 text-sm text-white/90">{statusMessage}</div>
          ) : null}
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
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm">Contact Information</h4>
                        {isEditing ? (
                          <Button
                            size="sm"
                            className="bg-primary text-white"
                            onClick={() => {
                              if (!id) return;
                              updateStudentMutation.mutate({ studentId: id, payload: {
                                firstName: profileForm.firstName,
                                lastName: profileForm.lastName,
                                phone: profileForm.phone,
                                emergencyPhone: profileForm.emergencyPhone,
                                address: profileForm.address,
                                city: profileForm.city,
                                state: profileForm.state,
                                pinCode: profileForm.pinCode,
                                branch: profileForm.branch,
                                course: profileForm.course,
                                year: profileForm.year,
                              } });
                            }}
                            disabled={updateStudentMutation.isLoading}
                          >
                            Save
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">First Name</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.firstName ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, firstName: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.firstName}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last Name</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.lastName ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, lastName: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.lastName}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.phone ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, phone: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Emergency Phone</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.emergencyPhone ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, emergencyPhone: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.emergencyPhone}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          {isEditing ? (
                            <Input
                              value={profileForm.address ?? ''}
                              onChange={(e) => setProfileForm((current) => ({ ...current, address: e.target.value }))}
                            />
                          ) : (
                            <p className="text-sm">{student.address}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">City</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.city ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, city: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.city}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">State</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.state ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, state: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.state}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">PIN Code</p>
                            {isEditing ? (
                              <Input
                                value={profileForm.pinCode ?? ''}
                                onChange={(e) => setProfileForm((current) => ({ ...current, pinCode: e.target.value }))}
                              />
                            ) : (
                              <p className="text-sm">{student.pinCode}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4 space-y-4">
                      <h4 className="text-sm mb-3">Room Information</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Home className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Room Number</p>
                          <p className="text-sm">{currentRoomNumber || 'Not assigned'}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-500">Current occupancy</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {currentRoom ? `${currentRoom.currentOccupancy} / ${currentRoom.capacity}` : 'TBD'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-500">Available rooms</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {availableRooms.length} room{availableRooms.length === 1 ? '' : 's'} available
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs text-muted-foreground">Select room</label>
                        <select
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800"
                        >
                          <option value="">Choose a room</option>
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {`Room ${room.roomNumber} — ${room.currentOccupancy}/${room.capacity} occupied`}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={handleRoomSubmit}
                          disabled={assignRoomMutation.isLoading || changeRoomMutation.isLoading || !selectedRoomId}
                          className="w-full"
                        >
                          {currentRoomNumber ? 'Change Room' : 'Assign Room'}
                        </Button>
                        {roomMessage ? <p className="text-sm text-slate-500">{roomMessage}</p> : null}
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
                      {studentParentsQuery.isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading parents...</p>
                      ) : studentParentsQuery.data && studentParentsQuery.data.length > 0 ? (
                        studentParentsQuery.data.map((relation) => (
                          <div key={relation.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-xs text-muted-foreground">{relation.parent.relation}</p>
                                <p className="text-sm font-medium">{relation.parent.firstName} {relation.parent.lastName}</p>
                              </div>
                              {relation.isPrimary ? (
                                <Badge className="bg-green-500 text-white">Primary</Badge>
                              ) : null}
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm">{relation.parent.phone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm">{relation.parent.email || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No parent linked yet.</p>
                      )}
                    </div>
                  </Card>

                  <Card className="bg-card border-border">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm">Link Existing Parent</h4>
                        <span className="text-xs text-muted-foreground">Reuse parent record</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Parent ID</p>
                          <Input
                            value={parentIdToLink}
                            onChange={(e) => setParentIdToLink(e.target.value)}
                            placeholder="Paste an existing parent ID"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={parentIsPrimary}
                              onChange={(e) => setParentIsPrimary(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>Mark as primary parent</span>
                          </label>
                        </div>
                        {parentStatusMessage ? (
                          <p className="text-sm text-amber-600">{parentStatusMessage}</p>
                        ) : null}
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          onClick={() => {
                            if (!id) return;
                            setParentStatusMessage(null);
                            linkParentMutation.mutate({
                              studentId: id,
                              parentId: parentIdToLink,
                              isPrimary: parentIsPrimary,
                            });
                          }}
                          disabled={!parentIdToLink || linkParentMutation.isLoading}
                        >
                          Link Parent
                        </Button>
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
