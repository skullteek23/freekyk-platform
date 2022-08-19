import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
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
export class TeamProfileComponent implements OnInit, OnDestroy {
  isLoading = true;
  teamInfo$: Observable<TeamBasicInfo>;
  teamMoreInfo$: Observable<TeamMoreInfo>;
  stats$: Observable<StatsTeam>;
  members$: Observable<TeamMembers>;
  media$: Observable<string[]>;
  noPhotos = false;
  error = false;
  imgPath: string;
  id: string;
  subscriptions = new Subscription();
  constructor(
    private snackServ: SnackbarService,
    private store: Store<{ dash: DashState }>,
    private router: Router,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService
  ) { }
  ngOnInit(): void {
    const teamName = this.route.snapshot.params.teamName;
    this.getTeamInfo(teamName);
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  getTeamInfo(tName: string): void {
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
            ({
              id: doc.id,
              ...(doc.data() as TeamBasicInfo),
            } as TeamBasicInfo)
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
  getTeamMoreInfo(tid: string): void {
    this.teamMoreInfo$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('moreInfo')
      .get()
      .pipe(
        tap(() => (this.isLoading = false)),
        map(
          (resp) =>
            ({ id: resp.id, ...(resp.data() as TeamMoreInfo) } as TeamMoreInfo)
        ),
        share()
      );
  }
  getStats(tid: string): void {
    this.stats$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return resp.data() as TeamStats;
          }
        }),
        map(
          (resp) =>
          ({
            'FKC Played': resp.fkc_played.toString(),
            'FCP Played': resp.fcp_played.toString(),
            'FPL Played': resp.fpl_played.toString(),
            'Goals': resp.g.toString(),
            'Wins': resp.w.toString(),
            'Losses': resp.l.toString(),
            'Red cards': resp.rcards.toString(),
            'Yellow cards': resp.ycards.toString(),
            'Goals Conceded': resp.g_conceded.toString(),
          } as StatsTeam)
        )
      );
  }
  getTeamMedia(tid: string): void {
    this.media$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('media')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return (resp.data() as TeamMedia).media;
          }
          return [];
        })
      );
  }
  getTeamMembers(tid: string): void {
    this.members$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('members')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return resp.data() as TeamMembers;
          }
        })
      );
  }
  onChallengeTeam(): void {
    const uid = localStorage.getItem('uid');
    this.store
      .select('dash')
      .pipe(map((resp) => resp))
      .subscribe(async (team) => {
        if (team.hasTeam == null) {
          this.snackServ.displayCustomMsg(
            'Join or create a team to perform this action!'
          );
        } else if (team.hasTeam.capId !== uid) {
          this.snackServ.displayCustomMsg(
            'Only a Captain can perform this action!'
          );
        } else {
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
  onEnlargePhoto(): void {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
