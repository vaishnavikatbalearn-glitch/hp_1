import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLaundryRequests } from '../../services/api';
import { DataList } from '@/components/shared/DataList';
import { useDataList } from '@/hooks/useDataList';
import { formatDate, getStatusColor, formatStatus } from '@/utils/formatters';

export function WardenLaundryMonitoring() {
  const navigate = useNavigate();

  const laundryQuery = useQuery({
    queryKey: ['laundry-list'],
    queryFn: () => getLaundryRequests(),
  });

  const { data: laundry, isPending, isEmpty } = useDataList(laundryQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Laundry Monitoring</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <DataList
            data={laundry}
            isPending={isPending}
            isEmpty={isEmpty}
            emptyMessage="No laundry requests at the moment"
            loadingMessage="Loading laundry requests..."
          >
            {(l) => (
              <Card key={l.id} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">
                      {l.student?.firstName} {l.student?.lastName}
                    </p>
                    <Badge className={getStatusColor(l.status)}>
                      {formatStatus(l.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {l.student?.enrollmentNumber || 'N/A'} • {l.itemCount} items • {formatDate(l.collectedAt)}
                  </p>
                </div>
              </Card>
            )}
          </DataList>
        </div>
      </div>
    </div>
  );
}
