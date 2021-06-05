import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FreestylerCardComponent } from 'src/app/shared/dialogs/freestyler-card/freestyler-card.component';
import { ContestStats } from 'src/app/shared/interfaces/contest.model';
import { FsBasic } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-fs-co-stage-final',
  templateUrl: './fs-co-stage-final.component.html',
  styleUrls: ['./fs-co-stage-final.component.css'],
})
export class FsCoStageFinalComponent implements OnInit {
  @Input() cid: string;
  contStats$: Observable<{ id: string; name: string; imgpath: string }[]>;
  noWinners: boolean = false;
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) {}

  ngOnInit(): void {
    if (!!this.cid) {
      this.contStats$ = this.ngFire
        .collection(`contests/${this.cid}/additionalInfo`)
        .doc('statistics')
        .get()
        .pipe(
          tap((resp) => {
            this.noWinners = !resp.exists;
          }),
          map((resp) => <ContestStats>resp?.data()),
          map((resp) => [resp?.winner1, resp?.winner2, resp?.winner3])
        );
    }
  }
  async onViewProfile(fid: string) {
    let fsSnap = await this.ngFire
      .collection('freestylers')
      .doc(fid)
      .get()
      .pipe(map((resp) => <FsBasic>{ id: resp.id, ...(<FsBasic>resp.data()) }))
      .toPromise();
    const dialogRef = this.dialog.open(FreestylerCardComponent, {
      panelClass: 'fk-dialogs',
      data: fsSnap,
    });
  }
}
