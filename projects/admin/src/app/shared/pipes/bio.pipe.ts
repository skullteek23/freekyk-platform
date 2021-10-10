import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bio',
})
export class BioPipe implements PipeTransform {
  transform(value: string): string {
    if (!!value) return value;
    return 'Not available';
  }
}
