/**
 * Common utility functions for data formatting and mapping
 * Eliminates repeated logic across warden components
 */

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @param format 'short' | 'long' | 'time' (default: 'short')
 * @returns Formatted date string
 */
export function formatDate(dateString?: string, format: 'short' | 'long' | 'time' = 'short'): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return date.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'short':
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
}

/**
 * Format a date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format status strings (convert SNAKE_CASE to Title Case)
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Map status values to Tailwind color classes
 */
export const STATUS_COLOR_MAP: Record<string, string> = {
  // Complaint statuses
  OPEN: 'bg-amber-500',
  IN_PROGRESS: 'bg-blue-500',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-slate-500',

  // Laundry statuses
  COLLECTED: 'bg-blue-500',
  PROCESSING: 'bg-amber-500',
  READY: 'bg-green-500',
  DELIVERED: 'bg-slate-500',

  // Priority levels
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-red-500',

  // General status
  PENDING: 'bg-amber-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PAID: 'bg-green-500',
  UNPAID: 'bg-red-500',
};

export function getStatusColor(status: string | number): string {
  const statusStr = String(status).toUpperCase();
  return STATUS_COLOR_MAP[statusStr] || 'bg-slate-500';
}

/**
 * Map priority numbers to labels
 */
export const PRIORITY_LABEL_MAP: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

export function getPriorityLabel(priority: number): string {
  return PRIORITY_LABEL_MAP[priority] || 'Medium';
}

/**
 * Get initials from a full name
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = (firstName || '').charAt(0).toUpperCase();
  const last = (lastName || '').charAt(0).toUpperCase();
  return (first + last).slice(0, 2) || '?';
}

/**
 * Format full name
 */
export function formatFullName(firstName?: string, lastName?: string): string {
  const parts = [firstName || '', lastName || ''].filter(Boolean);
  return parts.join(' ') || 'Unknown';
}
