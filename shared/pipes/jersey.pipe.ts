import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jersey',
})
export class JerseyPipe implements PipeTransform {
  transform(value: number): string {
    if (!!value) {
      return `Jersey Number: #${value.toString()}`;
    }
    return 'Jersey Number: NA';
  }
}
