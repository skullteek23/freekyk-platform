import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { DashState } from 'src/app/dashboard/store/dash.reducer';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { NotificationBasic } from 'src/app/shared/interfaces/notification.model';
import { StatsTeam } from 'src/app/shared/interfaces/others.model';
import {
  TeamBasicInfo,
  TeamMedia,
  TeamMembers,
  TeamMoreInfo,
  TeamStats,
} from 'src/app/shared/interfaces/team.model';
import firebase from 'firebase/app';

@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.component.html',
  styleUrls: ['./team-profile.component.css'],
})
export class TeamProfileComponent implements OnInit {
  isLoading = true;
  teamInfo$: Observable<TeamBasicInfo>;
  teamMoreInfo$: Observable<TeamMoreInfo>;
  stats$: Observable<StatsTeam>;
  members$: Observable<TeamMembers>;
  media$: Observable<string[]>;
  noPhotos: boolean = false;
  error: boolean = false;
  imgPath: string;
  id: string;
  constructor(
    private snackServ: SnackbarService,
    private store: Store<{ dash: DashState }>,
    private router: Router,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService
  ) {
    const teamName = route.snapshot.params['teamid'];
    console.log(teamName);
    this.getTeamInfo(teamName);
  }
  ngOnInit(): void {}
  getTeamInfo(tName: string) {
    this.teamInfo$ = this.ngFire
      .collection('teams', (query) =>
        query.where('tname', '==', tName).limit(1)
      )
      .get()
      .pipe(
        tap((resp) => {
          if (!resp.empty) {
            const id = resp.docs[0].id;
            this.getTeamMoreInfo(id);
            this.getTeamMembers(id);
            this.getStats(id);
            this.getTeamMedia(id);
          } else {
            this.error = resp.empty;
            this.router.navigate(['error']);
          }
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <TeamBasicInfo>{ id: doc.id, ...(<TeamBasicInfo>doc.data()) }
          )
        ),
        map((resp) => resp[0]),
        tap((resp) => {
          this.imgPath = resp?.imgpath;
          this.id = resp.captainId;
        }),
        share()
      );
  }
  getTeamMoreInfo(tid: string) {
    this.teamMoreInfo$ = this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        tap((resp) => (this.isLoading = false)),
        map(
          (resp) =>
            <TeamMoreInfo>{ id: resp.id, ...(<TeamMoreInfo>resp.data()) }
        ),
        share()
      );
  }
  getStats(tid: string) {
    this.stats$ = this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) return <TeamStats>resp.data();
        }),
        map(
          (resp) =>
            <StatsTeam>{
              'FKC Played': resp.played.fkc,
              'FCP Played': resp.played.fcp,
              'FPL Played': resp.played.fpl,
              Goals: resp.g,
              Wins: resp.w,
              Losses: resp.l,
              'Red cards': resp.rcards,
              'Yellow cards': resp.ycards,
              'Goals Conceded': resp.g_conceded,
              'Clean Sheets': resp.cl_sheet,
            }
        )
      );
  }
  getTeamMedia(tid: string) {
    this.media$ = this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('media')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) return (<TeamMedia>resp.data()).media;
          return [];
        })
      );
  }
  getTeamMembers(tid: string) {
    this.members$ = this.ngFire
      .collection('teams/' + tid + '/additionalInfo')
      .doc('members')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) return <TeamMembers>resp.data();
        })
      );
  }
  onChallengeTeam() {
    const uid = localStorage.getItem('uid');
    this.store
      .select('dash')
      .pipe(map((resp) => resp))
      .subscribe(async (team) => {
        if (team.hasTeam == null)
          this.snackServ.displayCustomMsg(
            'Join or create a team to perform this action!'
          );
        else if (team.hasTeam.capId != uid)
          this.snackServ.displayCustomMsg(
            'Only a Captain can perform this action!'
          );
        else {
          const notif: NotificationBasic = {
            type: 'team challenge',
            senderId: uid,
            recieverId: this.id,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
            title: 'Team Challenge Recieved',
            senderName: team.hasTeam.name,
          };
          this.ngFire
            .collection(`players/${this.id}/Notifications`)
            .add(notif)
            .then(() =>
              this.snackServ.displayCustomMsg(
                'Challenge Notification sent to team captain.'
              )
            );
        }
      });
  }
  onEnlargePhoto() {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
