// Utility Functions
export function timeToString(time: number): string {
    const sign = time < 0 ? '-' : '';
    const absTime = Math.abs(time);

    const minutes = Math.floor(absTime / 60000);
    const seconds = Math.floor((absTime % 60000) / 1000);
    const hundredths = Math.floor((absTime % 1000) / 10);

    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export function getInt(value: string): number {
    return isNaN(Number(value)) ? 0 : Number(value);
}
