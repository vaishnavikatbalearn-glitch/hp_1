import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFloors } from '../../services/api';
import { DataList } from '@/components/shared/DataList';
import { useDataList } from '@/hooks/useDataList';

export function WardenFloorManagement() {
  const navigate = useNavigate();

  const floorsQuery = useQuery({
    queryKey: ['floors-list'],
    queryFn: () => getFloors(),
  });

  const { data: floors, isPending, isEmpty } = useDataList(floorsQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Floor Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <DataList
            data={floors}
            isPending={isPending}
            isEmpty={isEmpty}
            emptyMessage="No floors found"
            loadingMessage="Loading floors..."
          >
            {(f: any) => (
              <Card key={f.id || f.number} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Building className="text-purple-600" size={20} /></div>
                    <div><p className="text-sm">Floor {f.number}</p><p className="text-xs text-muted-foreground">Total Rooms: {f.totalRooms}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground">Occupied</p><p className="text-lg">{f.occupiedRooms}</p></div>
                    <div><p className="text-xs text-muted-foreground">Available</p><p className="text-lg text-green-600">{f.availableRooms}</p></div>
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
