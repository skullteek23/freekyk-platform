import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { TeamMembers, Tmember } from 'src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';
import { PlayerProfileComponent } from '../../player-profile/player-profile.component';

@Component({
  selector: 'app-te-members',
  templateUrl: './te-members.component.html',
  styleUrls: ['./te-members.component.css'],
})
export class TeMembersComponent implements OnInit {
  @Input('members') teamMembers: Tmember[] = [];
  plFilters = ['Playing Position'];
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) {}
  ngOnInit(): void {}
  async onOpenPlayerProfile(pid: string) {
    let playersnap = await this.ngFire
      .collection('players')
      .doc(pid)
      .get()
      .pipe(
        map((resp) => {
          return <PlayerBasicInfo>{
            id: pid,
            ...(<PlayerBasicInfo>resp.data()),
          };
        })
      )
      .toPromise();
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playersnap,
    });
  }
}
