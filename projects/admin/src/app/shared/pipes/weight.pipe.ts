import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weight',
})
export class WeightPipe implements PipeTransform {
  transform(value: number): string | number {
    if (!!value) {return value.toString() + ' kgs';}
    return value;
  }
}
