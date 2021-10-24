import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { DashState } from '../dashboard/store/dash.reducer';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountAvatarService {
  getProfilePicture(): Observable<any> {
    return this.store.select('dash').pipe(
      map((resp) => resp.playerBasicInfo.imgpath_sm),
      mergeMap((val) => {
        if (val) {
          return of(val);
        } else {
          return this.authServ.userDataChanged.pipe(
            map((user) => user?.imgpath)
          );
        }
      })
    );
  }
  constructor(
    private authServ: AuthService,
    private store: Store<{
      dash: DashState;
    }>
  ) {
    console.log('avatar service started');
  }
}
