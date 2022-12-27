import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterList',
})
export class FilterListPipe implements PipeTransform {
  transform(value: any[], keys: string, term: string): any[] {
    if (!term) {
      return value;
    }
    return value.filter((item) =>
      keys
        .split(',')
        .some(
          (key) =>
            item.hasOwnProperty(key) && new RegExp(term?.toLowerCase(), 'gi').test(item[key]?.toLowerCase())
        )
    );
  }
}
