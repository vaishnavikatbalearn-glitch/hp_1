import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { approveVisitorRequest, getPendingVisitorRequests, rejectVisitorRequest, type VisitorRequest } from '@/services/api';
import { DataList } from '@/components/shared/DataList';
import { useDataList } from '@/hooks/useDataList';
import { formatDate } from '@/utils/formatters';

export function WardenVisitorApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const visitorsQuery = useQuery({
    queryKey: ['visitor-requests'],
    queryFn: () => getPendingVisitorRequests(),
  });

  const { data: visitors, isPending, isEmpty } = useDataList(visitorsQuery);

  const handleApprove = async (id?: string) => {
    if (!id) return;
    try {
      await approveVisitorRequest(id);
      queryClient.invalidateQueries({ queryKey: ['visitor-requests'] });
    } catch {
      // keep UI unchanged on failure
    }
  };

  const handleReject = async (id?: string) => {
    if (!id) return;
    try {
      await rejectVisitorRequest(id);
      queryClient.invalidateQueries({ queryKey: ['visitor-requests'] });
    } catch {
      // keep UI unchanged on failure
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Visitor Approvals</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <DataList
            data={visitors}
            isPending={isPending}
            isEmpty={isEmpty}
            emptyMessage="No pending visitor requests"
            loadingMessage="Loading visitor requests..."
          >
            {(v: VisitorRequest) => {
              const studentName =
                v.student ? `${v.student.firstName || ''} ${v.student.lastName || ''}`.trim() : 'Student';
              const visitTime = v.expectedDate ? formatDate(v.expectedDate, 'time') : '';
              return (
                <Card key={v.id} className="bg-card border-border">
                  <div className="p-4">
                    <p className="text-sm mb-1">{v.visitorName}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Visiting: {studentName} ({v.relation || 'Visitor'}) • {visitTime}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">Purpose: {v.purpose}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleApprove(v.id)}>
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => handleReject(v.id)}>
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
