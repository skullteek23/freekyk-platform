import { Injectable } from '@angular/core';
import * as TeamCommActions from '../dashboard/dash-team-manag/da-te-communication/store/teamComm.actions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { map, take, tap, filter } from 'rxjs/operators';
import {
  Tmember,
  ActiveSquadMember,
  MemberResponseNotification,
} from '../shared/interfaces/team.model';
import { SnackbarService } from './snackbar.service';
import { TeamState } from '../dashboard/dash-team-manag/store/team.reducer';
import { TeamCommState } from '../dashboard/dash-team-manag/da-te-communication/store/teamComm.reducer';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class TeamCommunicationService {
  setSelectedMatch(selection: number) {
    this.store.dispatch(new TeamCommActions.SelectUpmMatchNo(selection));
  }
  setActiveSquad(selection: ActiveSquadMember[]) {
    this.store.dispatch(new TeamCommActions.SelectedActiveSquad(selection));
  }
  updateResponseByMember(response: boolean) {
    return this.store
      .select('teamComms')
      .pipe(take(1))
      .subscribe(async (resp) => {
        if (
          resp.currUpcomingMatchNo < 0 ||
          resp.currUpcomingMatchNo > 2 ||
          resp.currUpcomingMatchNo == undefined ||
          resp.currUpcomingMatchNo == null
        )
          return null;
        const uid = localStorage.getItem('uid');
        if (
          resp.activeSquad.every((sq) => sq.id != uid) ||
          resp.activeSquad.length == 0
        ) {
          this.snackServ.displayCustomMsgLong(
            'Only Players included in active squad can accept/reject the invitation'
          );
          return null;
        }
        const tid = sessionStorage.getItem('tid');
        const respSnap = this.ngFire
          .collection(
            'teamCommunications/' +
              tid +
              '/activeSquad' +
              resp.currUpcomingMatchNo.toString()
          )
          .doc(uid)
          .update({
            response: response ? 'accept' : 'reject',
          });

        return respSnap
          .then(() => {
            const accept = ' has accepted the invitation for this fixture.';
            const deny = ' has rejected the invitation for this fixture.';
            const pname = sessionStorage.getItem('name');
            const log: MemberResponseNotification = {
              content: pname + (response ? accept : deny),
              time: new Date().getTime(),
            };
            console.log(log);
            this.updateTeamActivity(log, resp.currUpcomingMatchNo);
          })
          .then(() => this.snackServ.displaySent())
          .catch((error) => {
            console.log(error);
            this.snackServ.displayError();
          });
      });
  }
  createActiveSquadByCaptain(members: Tmember[]) {
    return this.store
      .select('teamComms')
      .pipe(
        // tap((resp) => console.log(resp?.currUpcomingMatchNo)),
        map((resp) => +resp?.currUpcomingMatchNo),
        take(1)
      )
      .subscribe(async (matchNo) => {
        if (
          matchNo < 0 ||
          matchNo > 2 ||
          matchNo == undefined ||
          matchNo == null
        )
          return null;
        const tid = sessionStorage.getItem('tid');
        var batch = this.ngFire.firestore.batch();
        for (let i = 0; i < members.length; i++) {
          const docId = members[i].id;
          const newData: ActiveSquadMember = {
            name: members[i].name,
            id: members[i].id,
            pl_pos: members[i].pl_pos,
            imgpath_sm: members[i].imgpath_sm,
            response: 'wait',
          };
          const colRef = this.ngFire
            .collection(
              'teamCommunications/' + tid + '/activeSquad' + matchNo.toString()
            )
            .doc(docId).ref;
          batch.set(colRef, newData);
        }
        return await batch
          .commit()
          .then(() => {
            const newLog: MemberResponseNotification = {
              content:
                'Team Captain has asked ' +
                members.map((m) => m.name).join(', ') +
                ' for their status.',
              time: new Date().getTime(),
            };
            this.updateTeamActivity(newLog, matchNo);
          })
          .then(() => this.snackServ.displayComplete());
      });
  }
  getActiveSquad(upcomingMatchNo: number) {
    const teamId = sessionStorage.getItem('tid');
    this.ngFire
      .collection('teamCommunications')
      .doc(teamId)
      .collection('activeSquad' + upcomingMatchNo.toString())
      .valueChanges()
      .pipe(
        tap((resp: ActiveSquadMember[]) => {
          console.log(resp);
          this.setActiveSquad(resp);
        }),
        map((resp) => {
          if (resp) return false;
          return true;
        })
      )
      .subscribe();
  }
  private updateTeamActivity(
    content: MemberResponseNotification,
    matchNo: number
  ) {
    const tid = sessionStorage.getItem('tid');
    this.ngFireDb
      .list('teamActivity/' + tid + '/activity' + matchNo.toString())
      .push(content);
    console.log(content);
  }

  ngOnDestroy() {
    console.log('Comms service ended');
  }
  constructor(
    private ngFire: AngularFirestore,
    private ngFireDb: AngularFireDatabase,
    private snackServ: SnackbarService,
    // private store: Store<fromApp.AppState>,

    private store: Store<{ teamComms: TeamCommState }>,
    private store2: Store<{ team: TeamState }>
  ) {
    console.log('Comms service started');
    let tid = sessionStorage.getItem('tid');
    if (!!tid) this.getActiveSquad(0);
  }
}
