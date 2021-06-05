import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { FreestylerCardComponent } from 'src/app/shared/dialogs/freestyler-card/freestyler-card.component';
import { ContestSubmission } from 'src/app/shared/interfaces/contest.model';
import {
  StageDataModel,
  StageTable,
} from 'src/app/shared/interfaces/others.model';
import { FsBasic } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-fs-co-stage',
  templateUrl: './fs-co-stage.component.html',
  styleUrls: ['./fs-co-stage.component.css'],
})
export class FsCoStageComponent implements OnInit {
  @Input('stage') stage: number = 0;
  @Input() cid: string;
  StageDataSource$: Observable<StageTable[]>;
  cols = ['freestyler', 'submissionLink'];
  selectedRowIndex: number = -1;
  constructor(
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService
  ) {}
  ngOnInit(): void {
    if (!!this.stage) {
      this.StageDataSource$ = this.ngFire
        .collection(
          'contests/' +
            this.cid +
            '/videoSubmissions-STAGE-' +
            this.stage.toString()
        )
        .get()
        .pipe(
          map((resp) => resp.docs.map((doc) => <ContestSubmission>doc.data())),
          map((resp) =>
            resp.map(
              (cDoc) =>
                <StageTable>{
                  freestyler: {
                    id: cDoc.uid,
                    name: cDoc.name,
                    nickname: cDoc.nickname,
                    age: cDoc.age,
                    country: cDoc.locCountry,
                  },
                  submissionLink: cDoc.subm,
                }
            )
          ),
          share()
        );
    }
  }
  onOpenVideo(vidLink: string) {
    this.enlServ.onOpenVideo(vidLink);
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
