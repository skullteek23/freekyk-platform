import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contactNumber',
})
export class ContactNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (!!value) {
      return `+91${value.toString()}`;
    }
    return null;
  }
}
