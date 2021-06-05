import { Injectable } from '@angular/core';

import * as fromApp from '../store/app.reducer';
import * as dashActions from '../dashboard/store/dash.actions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import {
  FsBasic,
  SocialMediaLinks,
  PlayerBasicInfo,
  PlayerMoreInfo,
  BasicStats,
  FsStats,
} from '../shared/interfaces/user.model';
import { DashboardModule } from '../dashboard/dashboard.module';
@Injectable()
export class PlayerService {
  fetchPlayerStats(uid: string) {
    return this.ngfire
      .collection('players/' + uid + '/additionalInfo')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => {
          if (!resp.exists) return { apps: 0, g: 0, w: 0, cards: 0, l: 0 };
          return <BasicStats>resp.data();
        })
      );
  }
  fetchFsStats(uid: string) {
    return this.ngfire
      .collection('freestylers/' + uid + '/additionalInfoFs')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => {
          if (!resp.exists)
            return { sk_lvl: 0, br_colb: [], tr_a: 0, tr_w: 0, tr_u: 0 };
          return <FsStats>resp.data();
        })
      );
  }

  private fetchPlayerBasicInfoFs(uid: string) {
    this.ngfire
      .collection('freestylers')
      .doc(uid)
      .valueChanges()
      .subscribe((data) =>
        this.store.dispatch(new dashActions.AddFsInfo(<FsBasic>data))
      );
  }
  private fetchSMLinks(uid: string) {
    this.ngfire
      .collection('players/' + uid + '/additionalInfo')
      .doc('socialMedia')
      .snapshotChanges()
      .pipe(
        map((resp) => {
          if (!resp.payload.exists) return null;
          return <SocialMediaLinks>{
            ig: (<SocialMediaLinks>resp.payload.data()).ig,
            yt: (<SocialMediaLinks>resp.payload.data()).yt,
            fb: (<SocialMediaLinks>resp.payload.data()).fb,
            tw: (<SocialMediaLinks>resp.payload.data()).tw,
          };
        })
      )
      .subscribe((data: SocialMediaLinks) => {
        if (data != null) this.store.dispatch(new dashActions.AddSocials(data));
      });
  }
  private fetchPlayerBasicInfo(uid: string) {
    this.ngfire
      .collection('players')
      .doc(uid)
      .valueChanges()
      .subscribe((data: PlayerBasicInfo) => {
        this.store.dispatch(new dashActions.AddBasicInfo(data));
        if (data.team != null) {
          this.store.dispatch(new dashActions.CheckPlayerHasTeam(data.team));
          if (data.team?.capId == uid)
            this.store.dispatch(new dashActions.CheckPlayerIsCaptain(true));
        }
      });
  }
  private fetchPlayerMoreInfo(uid: string) {
    this.ngfire
      .collection('players/' + uid + '/additionalInfo')
      .doc('otherInfo')
      .valueChanges()
      .subscribe((data: PlayerMoreInfo) => {
        if (data != undefined)
          this.store.dispatch(new dashActions.AddMoreInfo(data));
      });
  }
  ngOnDestroy() {
    console.log('Player service ended');
  }
  initPlayerData() {
    const uid = localStorage.getItem('uid');
    this.fetchPlayerBasicInfo(uid);
    this.fetchPlayerMoreInfo(uid);
    this.fetchSMLinks(uid);
    this.fetchPlayerBasicInfoFs(uid);
  }
  constructor(
    private ngfire: AngularFirestore,
    private store: Store<fromApp.AppState>
  ) {
    console.log('Player service started');
    this.initPlayerData();
  }
}
