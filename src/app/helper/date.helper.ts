export function getFormattedDateSince(date: string): string {
    const dateSince = new Date(date).getTime();
    const currentDate = Date.now();
    const diff = Math.floor((currentDate - dateSince) / 1000);

    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);

    const timeParts: string[] = [];

    if (days > 0) {
      timeParts.push(`${days}d`);
    }
    if (hours > 0) {
      timeParts.push(`${hours}h`);
    }
    if (minutes > 0) {
      timeParts.push(`${minutes}min`);
    }

    return timeParts.length > 0 ? `${timeParts.join(' ')} ago` : 'Just now';
  }

  export function getTimeSince(date: string): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    // Parse difference as 'hh:mm:ss' format with leading zeros
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }