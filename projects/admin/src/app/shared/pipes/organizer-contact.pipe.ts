import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'organizerContact',
})
export class OrganizerContactPipe implements PipeTransform {
  transform(value: number): string {
    return '+91 ' + value.toString();
  }
}
