import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'refreshmentContact',
})
export class RefreshmentContactPipe implements PipeTransform {
  transform(value: number): string {
    return '+91 ' + value.toString();
  }
}
