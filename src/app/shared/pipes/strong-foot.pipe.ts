import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strongFoot',
})
export class StrongFootPipe implements PipeTransform {
  transform(value: 'L' | 'R'): string {
    if (!!value) {
      return value === 'L' ? 'Left Footed' : 'Right Footed';
    }
    return value;
  }
}
