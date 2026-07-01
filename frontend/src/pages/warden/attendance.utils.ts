import { escapeCsv } from '../../utils/download';

export function attendanceSummaryToCsv(daily: any[], summary: any) {
  const lines: string[] = [];
  lines.push(['date', 'present', 'absent', 'onLeave', 'late'].join(','));
  (daily || []).forEach((d) => {
    const date = d.date ?? '';
    const present = d.present ?? 0;
    const absent = d.absent ?? 0;
    const onLeave = d.onLeave ?? d.on_leave ?? 0;
    const late = d.late ?? 0;
    lines.push([escapeCsv(date), present, absent, onLeave, late].join(','));
  });

  lines.push('');
  lines.push('Summary');
  lines.push(['total', escapeCsv(summary?.total ?? '')].join(','));
  lines.push(['present', escapeCsv(summary?.present ?? '')].join(','));
  lines.push(['absent', escapeCsv(summary?.absent ?? '')].join(','));
  lines.push(['onLeave', escapeCsv(summary?.onLeave ?? summary?.on_leave ?? '')].join(','));
  lines.push(['late', escapeCsv(summary?.late ?? '')].join(','));

  return lines.join('\n');
}

export function absenteesRecordsToCsv(records: any[]) {
  const lines: string[] = [];
  lines.push(['studentId', 'name', 'room', 'status', 'date', 'remarks'].join(','));
  (records || []).forEach((r) => {
    const student = r?.student ?? {};
    const id = student?.id ?? r?.studentId ?? '';
    const first = student?.firstName ?? '';
    const last = student?.lastName ?? '';
    const name = [first, last].filter(Boolean).join(' ').trim() || r?.name || 'Student';
    const room = student?.roomNumber || student?.room || '';
    const status = r?.status ?? '';
    const date = r?.date ?? r?.timestamp ?? '';
    const remarks = r?.remarks ?? '';
    lines.push([escapeCsv(id), escapeCsv(name), escapeCsv(room), escapeCsv(status), escapeCsv(date), escapeCsv(remarks)].join(','));
  });
  return lines.join('\n');
}
