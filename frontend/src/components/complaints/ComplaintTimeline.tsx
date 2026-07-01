import React from 'react';
import { Card } from '@/components/ui/card';

export function ComplaintTimeline({ events }: { events: Array<any> }) {
  if (!events || !events.length) return <Card className="p-4">No timeline available</Card>;

  return (
    <div className="space-y-2">
      {events.map((e, i) => (
        <Card key={i} className="p-3 bg-card border-border">
          <div className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</div>
          <div className="text-sm font-medium">{e.action}</div>
          {e.userId ? <div className="text-xs">By: {e.userId} ({e.userRole})</div> : null}
          {e.newValues && <div className="text-xs text-muted-foreground mt-1">{JSON.stringify(e.newValues)}</div>}
        </Card>
      ))}
    </div>
  );
}

export default ComplaintTimeline;
