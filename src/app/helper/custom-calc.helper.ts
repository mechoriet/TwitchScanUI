export function getMessagesPerMinute(messageCount: number, startDate: string): number {
    const dateSince = new Date(startDate).getTime();
    const currentDate = Date.now();
    const diff = Math.floor((currentDate - dateSince) / 1000);

    const totalMinutes = Math.floor(diff / 60);
    return messageCount / totalMinutes;
}