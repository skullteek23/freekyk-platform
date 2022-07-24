import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToAMPM'
})
export class NumberToAMPMPipe implements PipeTransform {

  transform(value: number): string {
    return value > 12 ? `${(value - 12)} PM` : `${value} AM`;
  }

}
