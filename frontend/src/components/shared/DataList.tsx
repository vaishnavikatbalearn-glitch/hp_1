import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface DataListProps<T> {
  data: T[];
  isPending: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  children: (item: T, index: number) => ReactNode;
}

/**
 * Reusable component for rendering data lists with loading/empty states
 * Eliminates repeated conditional rendering logic
 */
export function DataList<T>({
  data,
  isPending,
  isEmpty,
  emptyMessage = 'No items found',
  loadingMessage = 'Loading...',
  children,
}: DataListProps<T>) {
  if (isPending) {
    return (
      <Card className="bg-card border-border">
        <div className="p-4 text-center text-muted-foreground">{loadingMessage}</div>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="bg-card border-border">
        <div className="p-4 text-center text-muted-foreground">{emptyMessage}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={`${index}`}>{children(item, index)}</div>
      ))}
    </div>
  );
}
