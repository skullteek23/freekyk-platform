import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameCombo',
})
export class NameComboPipe implements PipeTransform {
  transform(name: string, nickname: string | null): string {
    if (!!name == false) {return 'Player Name';}
    if (!!nickname == false) {return name;}
    const f_name: string = name.split(' ')[0];
    const l_name: string = name.slice(f_name.length + 1);
    return f_name.concat(' \'').concat(nickname).concat('\' ').concat(l_name);
  }
}
