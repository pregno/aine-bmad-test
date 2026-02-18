/**
 * Format a date string (ISO 8601) as a relative or short time string.
 * Examples: "just now", "2 min ago", "10:30 AM"
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  let diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) diffMs = 0; // future dates → treat as "just now"
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24 && date.getDate() === now.getDate())
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
