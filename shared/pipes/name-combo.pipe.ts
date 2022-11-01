import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameCombo',
})
export class NameComboPipe implements PipeTransform {
  transform(name: string, nickname: string | null): string {
    if (!!name === false) {
      return 'Player Name';
    }
    if (!!nickname === false) {
      return name;
    }
    const firstName: string = name.split(' ')[0];
    const lastName: string = name.slice(firstName.length + 1);
    return (
      firstName
        .concat(` '`)
        .concat(nickname)
        .concat(`' `)
        .concat(lastName)
    );
  }
}
