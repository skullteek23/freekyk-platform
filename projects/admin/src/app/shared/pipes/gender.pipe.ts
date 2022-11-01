import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  transform(value: 'M' | 'F'): string {
    if (!!value) {return value == 'M' ? 'Male' : 'Female';}
    return value;
  }
}
