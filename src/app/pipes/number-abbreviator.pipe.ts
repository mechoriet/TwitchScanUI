import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberAbbreviator',
  standalone: true
})
export class NumberAbbreviatorPipe implements PipeTransform {

  transform(value: number): string {
    if (value < 1000) {
      return value.toString();
    } else if (value >= 1000 && value < 1000000) {
      return (value / 1000).toFixed(1) + 'k';
    } else if (value >= 1000000 && value < 1000000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else {
      return (value / 1000000000).toFixed(1) + 'B';
    }
  }

}
