import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getComplaints, updateComplaintStatus, getComplaintTimeline } from '../../services/api';
import ComplaintTimeline from '@/components/complaints/ComplaintTimeline';
import { DataList } from '@/components/shared/DataList';
import { useDataList } from '@/hooks/useDataList';
import { getPriorityLabel, getStatusColor, formatStatus } from '@/utils/formatters';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export function WardenComplaintManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const complaintsQuery = useQuery({
    queryKey: ['complaints-list', { search, status: statusFilter }],
    queryFn: () => getComplaints({ search: search || undefined, status: statusFilter || undefined }),
  });

  const { data: complaints, isPending, isEmpty } = useDataList(complaintsQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Complaint Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <Input placeholder="Search complaints, student or enrollment" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataList
            data={complaints}
            isPending={isPending}
            isEmpty={isEmpty}
            emptyMessage="No complaints at the moment"
            loadingMessage="Loading complaints..."
          >
            {(c) => (
              <Card key={c.id} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="text-red-600" size={18} />
                      <p className="text-sm font-medium">{c.category}</p>
                    </div>
                    <Badge className={getStatusColor(c.priority)}>
                      {getPriorityLabel(c.priority)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {c.student?.firstName} {c.student?.lastName}
                  </p>
                  <p className="text-sm font-medium mb-2">{c.subject}</p>
                  <p className="text-xs text-muted-foreground mb-3">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(c.status)}>
                      {formatStatus(c.status)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          await updateComplaintStatus(c.id, 'RESOLVED');
                          // refetch list
                          complaintsQuery.refetch();
                        }}
                      >Resolve</button>
                      <button
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-slate-700 px-2 py-1 rounded"
                        onClick={async () => {
                          const events = await getComplaintTimeline(c.id);
                          // open simple modal — for now, alert JSON
                          window.alert(JSON.stringify(events, null, 2));
                        }}
                      >Timeline</button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </DataList>
        </div>
      </div>
    </div>
  );
}
