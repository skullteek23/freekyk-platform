import { Injectable, OnDestroy } from '@angular/core';
import * as fromApp from '../store/app.reducer';
import * as TeamActions from '../dashboard/dash-team-manag/store/team.actions';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { map, take, tap } from 'rxjs/operators';
import { MatchFixture } from '@shared/interfaces/match.model';
import { NO_TEAM, CAPTAIN_ONLY, ALREADY_IN_TEAM, TeamMedia, TeamMembers, TeamBasicInfo, TeamMoreInfo, TeamStats, MEMBER_ONLY, Tmember, INCOMPLETE_PROFILE, PHOTO_NOT_UPLOADED, } from '@shared/interfaces/team.model';
import { SnackbarService } from './snackbar.service';
import { TeamsettingsComponent } from '../dashboard/dialogs/teamsettings/teamsettings.component';
import { TeamcreateComponent } from '../dashboard/dialogs/teamcreate/teamcreate.component';
import { Invite } from '@shared/interfaces/notification.model';
import { TeamCommsMobileComponent } from '@shared/components/team-comms-mobile/team-comms-mobile.component';
import { TeamjoinComponent } from '../dashboard/dialogs/teamjoin/teamjoin.component';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { DashState } from '../dashboard/store/dash.reducer';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { Observable } from 'rxjs';
import { TeamgalleryComponent } from '@app/dashboard/dialogs/teamgallery/teamgallery.component';
import { UploadTeamPhotoComponent } from './../dashboard/dialogs/upload-team-photo/upload-team-photo.component';
import firebase from 'firebase/app';
import { MatchConstants } from '@shared/constants/constants';
@Injectable({
  providedIn: 'root',
})
export class TeamService implements OnDestroy {
  onOpenTeamSettingsDialog(): void {
    this.store
      .select('dash')
      .pipe(
        map((currState) => ({ team: currState.hasTeam, isCaptain: currState.isCaptain })),
        take(1)
      )
      .subscribe((state) => {
        if (state.team === null) {
          this.handlePermissionErrors(NO_TEAM);
        } else if (!state.isCaptain) {
          this.handlePermissionErrors(CAPTAIN_ONLY);
        } else {
          this.dialog.open(TeamsettingsComponent, {
            panelClass: 'large-dialogs',
            disableClose: true,
          });
        }
      });
  }

  onOpenTeamGalleryDialog(): void {
    this.store
      .select('dash')
      .pipe(
        map((currState) => ({ team: currState.hasTeam, isCaptain: currState.isCaptain })),
        take(1)
      )
      .subscribe((state) => {
        if (state.team === null) {
          this.handlePermissionErrors(NO_TEAM);
        } else if (!state.isCaptain) {
          this.handlePermissionErrors(CAPTAIN_ONLY);
        } else {
          this.dialog.open(TeamgalleryComponent, {
            panelClass: 'fk-dialogs',
            disableClose: true,
          });
        }
      });

  }

  onOpenTeamPhotoDialog(): void {
    this.store
      .select('dash')
      .pipe(
        map((currState) => ({ team: currState.hasTeam, isCaptain: currState.isCaptain })),
        take(1)
      )
      .subscribe((state) => {
        if (state.team === null) {
          this.handlePermissionErrors(NO_TEAM);
        } else if (!state.isCaptain) {
          this.handlePermissionErrors(CAPTAIN_ONLY);
        } else {
          this.dialog.open(UploadTeamPhotoComponent, {
            panelClass: 'large-dialogs',
            disableClose: true,
          });
        }
      });
  }

  onOpenCreateTeamDialog(): void {
    this.store
      .select('dash')
      .pipe(
        map(checkProfileComplete),
        map((currState: any) => {
          if (currState !== 1 && currState !== 2) {
            return { team: currState.hasTeam, isCaptain: currState.isCaptain };
          }
          return currState;
        }),
        take(1)
      )
      .subscribe((state) => {
        if (state === 1) {
          this.onIncompleteProfile('player');
        } else if (state === 2) {
          this.handlePermissionErrors(PHOTO_NOT_UPLOADED);
        } else {
          if (state.team !== null) {
            this.handlePermissionErrors(ALREADY_IN_TEAM);
          } else {
            this.dialog.open(TeamcreateComponent, {
              panelClass: 'large-dialogs',
              disableClose: true,
            });
          }
        }
      });
  }

  onIncompleteProfile(section: 'player' | 'freestyle'): void {
    this.handlePermissionErrors(INCOMPLETE_PROFILE);
    this.router.navigate(['/dashboard', 'account', 'profile'], {
      fragment: section,
    });
  }

  onOpenTeamCommsMobileDialog(): void {

  }

  onOpenJoinTeamDialog(): void {
    this.store
      .select('dash')
      .pipe(
        map(checkProfileComplete),
        map((currState: any) => {
          if (currState !== 1 && currState !== 2) {
            return { team: currState.hasTeam, isCaptain: currState.isCaptain };
          }
          return currState;
        }),
        take(1)
      )
      .subscribe((state: any) => {
        if (state === 1) {
          this.onIncompleteProfile('player');
        } else if (state === 2) {
          this.handlePermissionErrors(PHOTO_NOT_UPLOADED);
        } else {
          if (state.team !== null) {
            this.handlePermissionErrors(ALREADY_IN_TEAM);
          } else {
            this.dialog.open(TeamjoinComponent, {
              panelClass: 'large-dialogs',
              disableClose: true,
            });
          }
        }
      });
  }
  getTeamGallery(tid: string): Observable<string[]> {
    return this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('media')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return (resp.data() as TeamMedia).media;
          }
          return null;
        })
      );
  }

  getTeamInvites(tid: string): Observable<Invite[]> {
    return this.ngFire
      .collection('invites', (query) => query.where('teamId', '==', tid))
      .snapshotChanges()
      .pipe(
        map((docs) =>
          docs.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as Invite),
            } as Invite)
          )
        )
      );
  }
  private async getTeamMembers(tid: string): Promise<any> {
    this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('members')
      .valueChanges()
      .pipe(
        map((resp) => resp as TeamMembers)
      )
      .subscribe((members) =>
        this.store.dispatch(new TeamActions.AddMembers(members))
      );
  }
  private async getTeamBasicInfo(tid: string): Promise<any> {
    this.ngFire
      .collection('teams')
      .doc(tid)
      .get()
      .pipe(
        map((resp) => {
          if (!resp.exists) {
            return null;
          }
          return {
            id: resp.id,
            ...(resp.data() as TeamBasicInfo),
          } as TeamBasicInfo;
        })
      )
      .subscribe((teamData) =>
        this.store.dispatch(new TeamActions.AddBasicInfo(teamData))
      );
  }
  private async getTeamMoreInfo(tid: string): Promise<any> {
    this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        map((resp) => {
          if (!resp.exists) {
            return null;
          }
          return resp.data() as TeamMoreInfo;
        })
      )
      .subscribe((teamData) =>
        this.store.dispatch(new TeamActions.AddMoreInfo(teamData))
      );
  }
  async getTeamStats(tid: string): Promise<any> {
    this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('statistics')
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.store.dispatch(
              new TeamActions.AddTeamStats(resp.data() as TeamStats)
            );
          }
        })
      )
      .toPromise();
  }
  private async getSixUpcomingMatches(tName: string): Promise<any> {
    const upmSnap = await this.ngFire
      .collection('allMatches', (query) =>
        query
          .where('teams', 'array-contains', tName)
          .where('concluded', '==', false)
          .orderBy('date', 'asc')
          .limit(MatchConstants.DEFAULT_DASHBOARD_FIXTURES_LIMIT)
      )
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              ({ id: doc.id, ...(doc.data() as MatchFixture) } as MatchFixture)
          )
        ),
        map((resp) => (resp.length === 0 ? [] : resp)),
        map(resp => resp.filter(el => el.date > new Date().getTime()))
      )
      .toPromise();
    this.store.dispatch(new TeamActions.AddUpcomingMatches(upmSnap));
  }

  onLeaveTeam(members: Tmember[]): Promise<any[]> {
    const tid = sessionStorage.getItem('tid');
    const uid = localStorage.getItem('uid');

    const mems = [...members];
    mems.splice(
      mems.findIndex((tm) => tm.id === uid),
      1
    );
    const allPromises = [];
    allPromises.push(
      this.ngFire
        .collection('teams/' + tid + '/additionalInfo')
        .doc('members')
        .update({
          memCount: firebase.firestore.FieldValue.increment(-1),
          members: mems,
        })
    );
    allPromises.push(
      this.ngFire.collection('players').doc(uid).update({
        team: null,
      })
    );
    return Promise.all(allPromises);
  }
  onDeleteTeam(): void {
    const tid = sessionStorage.getItem('tid');
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.DELETE_TEAM);
    callable({ teamId: tid })
      .toPromise()
      .then(() => {
        this.snackBarService.displayCustomMsg(
          'Your Team will be deleted shortly!'
        );
        location.reload();
      });
  }
  onRemovePlayer(pid: string, members: Tmember[]): Promise<any[]> {
    const tid = sessionStorage.getItem('tid');
    const mems = [...members];
    mems.splice(
      mems.findIndex((tm) => tm.id === pid),
      1
    );
    const allPromises = [];
    allPromises.push(
      this.ngFire
        .collection('teams/' + tid + '/additionalInfo')
        .doc('members')
        .update({
          memCount: firebase.firestore.FieldValue.increment(-1),
          members: mems,
        })
    );
    allPromises.push(
      this.ngFire.collection('players').doc(pid).update({
        team: null,
      })
    );
    return Promise.all(allPromises);
  }
  handlePermissionErrors(error: string): void {
    switch (error) {
      case NO_TEAM:
        this.snackBarService.displayCustomMsg(
          'Join or create a team to perform this action!'
        );
        break;
      case CAPTAIN_ONLY:
        this.snackBarService.displayCustomMsg(
          'Only a Captain can perform this action!'
        );
        break;
      case MEMBER_ONLY:
        this.snackBarService.displayCustomMsg(
          'Only Non-Captain Member can perform this action!'
        );
        break;
      case INCOMPLETE_PROFILE:
        this.snackBarService.displayCustomMsg('Complete your profile to proceed!');
        break;
      case PHOTO_NOT_UPLOADED:
        this.snackBarService.displayCustomMsg('Upload your Photo to proceed!');
        break;

      case ALREADY_IN_TEAM:
        this.snackBarService.displayCustomMsg('You are already a team member!');
        break;

      default:
        break;
    }
  }
  ngOnDestroy(): void {
    // console.log('Team service ended');
  }
  constructor(
    private ngFire: AngularFirestore,
    private dialog: MatDialog,
    private snackBarService: SnackbarService,
    private store: Store<fromApp.AppState>,
    private ngFunc: AngularFireFunctions,
    private router: Router
  ) {
    // console.log('Team service started');
    store.select('dash').subscribe((val) => {
      if (val.hasTeam !== null) {
        sessionStorage.setItem('tid', val.hasTeam.id);
        this.getTeamBasicInfo(val.hasTeam.id);
        this.getTeamMoreInfo(val.hasTeam.id);
        this.getTeamMembers(val.hasTeam.id);
        this.getTeamStats(val.hasTeam.id);
        this.getSixUpcomingMatches(val.hasTeam.name);
      }
    });
  }
}
export function checkProfileComplete(info: DashState): DashState | number {
  if (
    !!info.playerBasicInfo.imgpath_sm === false &&
    !!info.playerMoreInfo.imgpath_lg === false
  ) {
    return 2;
  }
  if (!!info.playerMoreInfo.profile) {
    return info;
  }
  return 1;
}
