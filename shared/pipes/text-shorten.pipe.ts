import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textShorten',
})
export class TextShortenPipe implements PipeTransform {
  transform(value: string, maxLength: number): string {
    if (!!value) {
      return value.length > maxLength
        ? value.slice(0, maxLength).concat('...')
        : value;
    }
    return value;
  }
}
