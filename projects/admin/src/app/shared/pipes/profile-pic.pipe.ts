import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'profilePic',
})
export class ProfilePicPipe implements PipeTransform {
  transform(value: string): string {
    if (!!value) {return value;}
    return '/assets/images/dummy_player_sm.jpg';
  }
}
