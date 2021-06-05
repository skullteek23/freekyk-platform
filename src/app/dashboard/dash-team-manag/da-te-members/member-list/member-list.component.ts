import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { Tmember } from 'src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit {
  @Input() margin: boolean = false;
  @Input('membersArray') teamMembers: Tmember[] = [];
  @Input() capId: string;
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
