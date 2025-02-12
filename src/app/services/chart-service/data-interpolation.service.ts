import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataInterpolationService {
  
  // Method to interpolate data over a specified interval (e.g., 1 minute)
  interpolateData(
    data: { time: string; value: number }[],
    intervalMs: number
  ): { time: Date; value: number }[] {
    if (data.length === 0) return [];
    // Parse the input data
    const parsedData = data.map(entry => ({
      time: new Date(entry.time).getTime(),
      value: entry.value,
    }));

    // Sort the data by time
    parsedData.sort((a, b) => a.time - b.time);

    const startTime = parsedData[0].time;
    const endTime = parsedData[parsedData.length - 1].time;

    const interpolatedData: { time: Date; value: number }[] = [];
    const dataMap = new Map<number, number>(parsedData.map(item => [item.time, item.value]));

    for (let time = startTime; time <= endTime; time += intervalMs) {
      interpolatedData.push({
        time: new Date(time),
        value: dataMap.get(time) || 0, // Fill missing points with 0
      });
    }

    return interpolatedData;
  }

  // Method to format the time for display
  formatTime(time: Date): string {
    const localTime = new Date(time);
    const localDay = localTime.getDate().toString().padStart(2, '0');
    const localHours = localTime.getHours().toString().padStart(2, '0');
    const localMinutes = localTime.getMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
  }
}
