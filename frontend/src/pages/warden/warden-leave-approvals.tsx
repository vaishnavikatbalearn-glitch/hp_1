import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '../../services/api';

export function WardenLeaveApprovals() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadLeaves = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get<{ data: any[] }>('/v1/leave/warden');
        setLeaves(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load pending leave requests.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  const handleApprove = async (leaveId: string) => {
    setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
    setError('');
    setSuccess('');
    try {
      await api.patch(`/v1/leave/${leaveId}/approve`, {});
      setLeaves((prev) => prev.filter((item) => item.id !== leaveId));
      setSuccess('Leave request approved successfully.');
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
      await api.patch(`/v1/leave/${leaveId}/reject`, { rejectionReason: reason.trim() });
      setLeaves((prev) => prev.filter((item) => item.id !== leaveId));
      setSuccess('Leave request rejected successfully.');
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
          {loading ? (
            <p className="text-sm text-slate-500">Loading pending leave requests…</p>
          ) : error ? (
            <Card className="bg-red-50 border border-red-200 p-4 text-red-700">{error}</Card>
          ) : success ? (
            <Card className="bg-emerald-50 border border-emerald-200 p-4 text-emerald-700">{success}</Card>
          ) : null}

          {leaves.length === 0 && !loading && !error ? (
            <Card className="bg-white border border-slate-200 p-6 text-center text-slate-600">
              No pending leave requests at the moment.
            </Card>
          ) : (
            leaves.map((leave) => {
              const studentName = leave.student ? `${leave.student.firstName} ${leave.student.lastName}` : 'Student';
              const duration = `${new Date(leave.startDate).toLocaleDateString('en-GB')} - ${new Date(leave.endDate).toLocaleDateString('en-GB')}`;
              return (
                <Card key={leave.id} className="bg-card border-border mb-4">
                  <div className="p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{studentName.split(' ').map((part: string) => part[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm mb-1 font-semibold text-slate-900">{studentName}</p>
                        <p className="text-xs text-muted-foreground mb-1">{leave.reason}</p>
                        <p className="text-xs text-muted-foreground">{duration}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4">
                      <div>
                        <p className="font-semibold text-slate-700">Destination</p>
                        <p>{leave.destination}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Contact</p>
                        <p>{leave.contactNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        <CheckCircle size={14} className="mr-1" />Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() => handleReject(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        <XCircle size={14} className="mr-1" />Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
