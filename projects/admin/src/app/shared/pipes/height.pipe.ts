import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'height',
})
export class HeightPipe implements PipeTransform {
  transform(value: number): string | number {
    if (!!value) return value.toString() + ' cms';
    return value;
  }
}
