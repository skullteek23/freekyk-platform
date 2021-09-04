import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import {
  MatchFixture,
  MatchLineup,
  tempFullFixtureData,
} from 'src/app/shared/interfaces/match.model';
import { TeamMembers } from 'src/app/shared/interfaces/team.model';

@Component({
  selector: 'app-match-card-admin',
  templateUrl: './match-card-admin.component.html',
  styleUrls: ['./match-card-admin.component.css'],
})
export class MatchCardAdminComponent implements OnInit {
  overviewForm: FormGroup;
  lineup: MatchLineup;
  constructor(
    public dialogRef: MatDialogRef<MatchCardAdminComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: MatchFixture,
    private ngFire: AngularFirestore
  ) {
    this.overviewForm = new FormGroup({
      ref: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9-]*$'),
      ]),
      stadium: new FormControl(data.stadium),
      desc: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9!., _-]*$'),
        Validators.maxLength(300),
        Validators.minLength(10),
      ]),
      organizer: new FormControl(null, Validators.required),
      refresh: new FormControl(false, Validators.required),
      ref_phno: new FormControl(null, [
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      org_phno: new FormControl(null, [
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      refresh_phno: new FormControl(null, [
        Validators.pattern('^[0-9]*$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      addr_line: new FormControl(null),
      live_link: new FormControl(null),
    });
  }
  ngOnInit(): void {}
  onCloseDialog(data: tempFullFixtureData) {
    this.dialogRef.close(data);
  }
  async onSubmit() {
    let teamAid = await this.ngFire
      .collection('teams', (query) =>
        query.where('tname', '==', this.data.teams[0])
      )
      .get()
      .pipe(map((resp) => resp.docs[0].id))
      .toPromise();
    let teamBid = await this.ngFire
      .collection('teams', (query) =>
        query.where('tname', '==', this.data.teams[1])
      )
      .get()
      .pipe(map((resp) => resp.docs[0].id))
      .toPromise();
    let teamLineupA = await this.ngFire
      .collection('teams/' + teamAid + '/additionalInfo')
      .doc('members')
      .get()
      .pipe(
        map((resp) => (<TeamMembers>resp.data()).members.map((mem) => mem.name))
      )
      .toPromise();
    let teamLineupB = await this.ngFire
      .collection('teams/' + teamBid + '/additionalInfo')
      .doc('members')
      .get()
      .pipe(
        map((resp) => (<TeamMembers>resp.data()).members.map((mem) => mem.name))
      )
      .toPromise();
    this.lineup = {
      home: teamLineupA,
      away: teamLineupB,
    };
    const doc: tempFullFixtureData = {
      fixture: <MatchFixture>{ ...this.data, id: this.ngFire.createId() },
      overview: this.overviewForm.value,
      lineup: this.lineup,
    };
    this.onCloseDialog(doc);
  }
}
