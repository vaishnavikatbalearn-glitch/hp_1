import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';
import { DataList } from '@/components/shared/DataList';
import { useDataList } from '@/hooks/useDataList';
import { formatDateRange, getInitials } from '@/utils/formatters';

interface LeaveRequest {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  destination: string;
  contactNumber: string;
  student?: {
    firstName: string;
    lastName: string;
  };
}

export function WardenLeaveApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const leavesQuery = useQuery({
    queryKey: ['leave-approvals'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LeaveRequest[] }>('/v1/leave/warden');
      return response.data.data ?? [];
    },
  });

  const { data: leaves, isPending, isEmpty } = useDataList(leavesQuery);

  const handleApprove = async (leaveId: string) => {
    setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(`/v1/leave/${leaveId}/approve`, {});
      setSuccess('Leave request approved successfully.');
      queryClient.invalidateQueries({ queryKey: ['leave-approvals'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve leave request.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleReject = async (leaveId: string) => {
    const reason = window.prompt('Please enter a rejection reason');
    if (!reason || !reason.trim()) return;

    setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(`/v1/leave/${leaveId}/reject`, { rejectionReason: reason.trim() });
      setSuccess('Leave request rejected successfully.');
      queryClient.invalidateQueries({ queryKey: ['leave-approvals'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject leave request.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/warden')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Leave Approvals</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          {error ? (
            <Card className="bg-red-50 border border-red-200 p-4 text-red-700 mb-4">{error}</Card>
          ) : null}

          {success ? (
            <Card className="bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 mb-4">{success}</Card>
          ) : null}

          <DataList
            data={leaves}
            isPending={isPending}
            isEmpty={isEmpty}
            emptyMessage="No pending leave requests at the moment"
            loadingMessage="Loading pending leave requests…"
          >
            {(leave) => {
              const studentName = leave.student
                ? `${leave.student.firstName} ${leave.student.lastName}`
                : 'Student';
              const duration = formatDateRange(leave.startDate, leave.endDate);
              return (
                <Card key={leave.id} className="bg-card border-border mb-4">
                  <div className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {getInitials(leave.student?.firstName, leave.student?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{studentName}</p>
                        <p className="text-xs text-muted-foreground">{duration}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Destination:</span> {leave.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Contact:</span> {leave.contactNumber}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() => handleReject(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }}
          </DataList>
        </div>
      </div>
    </div>
  );
}
