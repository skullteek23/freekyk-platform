import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { Tmember } from 'src/app/shared/interfaces/team.model';
import { TeamState } from '../../store/team.reducer';
import { TeamCommState } from '../store/teamComm.reducer';

@Component({
  selector: 'app-ask-player-selector',
  templateUrl: './ask-player-selector.component.html',
  styleUrls: ['./ask-player-selector.component.css'],
})
export class AskPlayerSelectorComponent implements OnInit {
  members$: Observable<Tmember[]>;
  constructor(
    public dialogRef: MatDialogRef<AskPlayerSelectorComponent>,
    private store2: Store<{ team: TeamState }>,
    private store3: Store<{ teamComms: TeamCommState }>,
    private commServ: TeamCommunicationService
  ) {}
  ngOnInit(): void {
    this.members$ = this.store2.select('team').pipe(
      tap((resp) => console.log(resp)),
      map((resp) => <Tmember[]>resp?.teamMembers.members),
      map((resp) =>
        resp.filter((respDoc) => respDoc.id != localStorage.getItem('uid'))
      )
    );
    this.store3.select('teamComms').subscribe((data) => console.log(data));
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  onConfirmPlayers(selections: MatListOption[]) {
    // console.log();
    this.commServ
      .createActiveSquadByCaptain(selections.map((sel) => sel.value))
      .unsubscribe();

    this.onCloseDialog();
    // const tid = sessionStorage.getItem('tid');
    // var batch = this.ngFire.firestore.batch();
    // console.log(this.data);
    // for (let i = 0; i < selections.length; i++) {
    //   const docRef = this.ngFire.firestore
    //     .collection('teamCommunications')
    //     .doc(tid)
    //     .collection('active-' + this.data)
    //     .doc((<Tmember>selections[i].value).id);
    //   const newDoc: ActiveSquadMember = {
    //     ...selections[i].value,
    //     response: 'wait',
    //   };
    //   console.log(newDoc);
    //   batch.set(docRef, newDoc);
    // }
    // console.log(batch);
    // batch.commit().then(this.onCloseDialog.bind(this));
    // this.store
    //   .select('team')
    //   .pipe(map((resp) => resp.basicInfo.tname))
    //   .subscribe((name) => {

    //   })
    //   .unsubscribe();

    // this.memberNames$ = this.
  }
}
