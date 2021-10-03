import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { Tmember } from 'src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-te-members',
  templateUrl: './te-members.component.html',
  styleUrls: ['./te-members.component.css'],
})
export class TeMembersComponent implements OnInit {
  @Input() members: Tmember[] = [];
  plFilters = ['Playing Position'];
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) {}
  ngOnInit(): void {}
  onOpenPlayerProfile(pid: string): void {
    this.ngFire
      .collection('players')
      .doc(pid)
      .get()
      .pipe(
        map((resp) => {
          return {
            id: pid,
            ...(resp.data() as PlayerBasicInfo),
          } as PlayerBasicInfo;
        })
      )
      .subscribe((response) => {
        const dialogRef = this.dialog.open(PlayerCardComponent, {
          panelClass: 'fk-dialogs',
          data: response,
        });
      });
  }
}
