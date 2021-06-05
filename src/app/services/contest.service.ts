import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { myContestData } from '../shared/interfaces/others.model';
import { Timestamp } from '@firebase/firestore-types';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { DashState } from '../dashboard/store/dash.reducer';
import { SnackbarService } from './snackbar.service';
import { ContestSubmission } from '../shared/interfaces/contest.model';

@Injectable({
  providedIn: 'root',
})
export class ContestService {
  currStage = 0;
  onOpenForm = new BehaviorSubject<boolean>(false);
  cid: string;
  setCurrentStage(stage: number) {
    this.currStage = stage;
  }
  setCid(id: string) {
    this.cid = id;
  }
  getCurrentStage() {
    return this.currStage;
  }
  onShowForm(open: boolean) {
    this.onOpenForm.next(open);
  }
  fetchUserContests() {
    const uid = localStorage.getItem('uid');
    return this.ngFire
      .collection('freestylers/' + uid + '/myContestFs')
      .valueChanges()
      .pipe(map((resp) => <myContestData[]>resp));
  }
  addContestSubmission(videoSubm: string) {
    this.store
      .select('dash')
      .pipe(
        take(2),
        map((resp) => resp.fsInfo)
      )
      .subscribe((data) => {
        const submission: ContestSubmission = {
          uid: localStorage.getItem('uid'),
          name: data.name,
          nickname: data.nickname,
          locCountry: data.locCountry,
          subm: videoSubm,
          age: this.calculateAge(data.born),
          appr: 'W',
        };
        this.ngFire
          .collection('contests')
          .doc(this.cid)
          .collection('videoSubmissions-STAGE-' + this.currStage.toString())
          .add(submission)
          .then(() => {
            this.onOpenForm.next(false);
            this.snackServ.displayCustomMsg('Video submitted successfully!');
          });
      });
  }
  calculateAge(birthdate: Timestamp) {
    if (birthdate == null) return null;
    return Math.abs(
      new Date(Date.now() - birthdate.seconds * 1000).getUTCFullYear() - 1970
    );
  }
  constructor(
    private ngFire: AngularFirestore,
    private store: Store<{ dash: DashState }>,
    private snackServ: SnackbarService
  ) {}
}
