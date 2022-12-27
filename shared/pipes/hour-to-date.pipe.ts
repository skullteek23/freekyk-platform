import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourToDate'
})
export class HourToDate implements PipeTransform {

  transform(value: number): number {
    const date = new Date();
    date.setHours(value, 0, 0, 0);
    return date.getTime();
  }

}
