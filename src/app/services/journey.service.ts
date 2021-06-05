import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { journeyVideo } from '../shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
import * as fromApp from '../store/app.reducer';
import * as dashActions from '../dashboard/store/dash.actions';
import { Store } from '@ngrx/store';
import { DashboardModule } from '../dashboard/dashboard.module';

@Injectable()
export class JourneyService implements OnDestroy {
  AddJourneyVideo(videoSubmission: journeyVideo) {
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('freestylers/' + uid + '/journeyFs')
      .add(videoSubmission)
      .then(() => this.snackServ.displayCustomMsg('Video Added Successfully!'));
  }

  ngOnDestroy() {
    console.log('Journey service ended');
  }
  constructor(
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private store: Store<fromApp.AppState>
  ) {
    console.log('Journey service started');
  }
}
