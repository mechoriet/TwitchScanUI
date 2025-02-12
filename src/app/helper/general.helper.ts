export function openStream(username: string): void {
    window.open(`https://twitch.tv/${username}`, '_blank');
}