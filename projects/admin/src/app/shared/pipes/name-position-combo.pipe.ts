import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'namePositionCombo',
})
export class NamePositionComboPipe implements PipeTransform {
  transform(name: string, plPos: string | null): string {
    if (plPos == null) {return name + ' (unknown)';}
    else {return name + ' (' + plPos + ')';}
  }
}
