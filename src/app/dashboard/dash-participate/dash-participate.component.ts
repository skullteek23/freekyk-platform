import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, share, take } from 'rxjs/operators';
import { PaymentService, PAYMENT_TYPE } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { OrderBasic } from 'src/app/shared/interfaces/order.model';
import { SeasonBasicInfo, SeasonParticipants } from 'src/app/shared/interfaces/season.model';
import { HOME, LOADING, SUCCESS, } from '../constants/constants';
import * as fromApp from '../../store/app.reducer';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dash-participate',
  templateUrl: './dash-participate.component.html',
  styleUrls: ['./dash-participate.component.css'],
})
export class DashParticipateComponent implements OnInit, OnDestroy {

  readonly SUCCESS = SUCCESS;
  readonly LOADING = LOADING;
  readonly HOME = HOME;

  hasTeam = true;
  loadingStatus: PAYMENT_TYPE = HOME;
  participatedTournaments: string[];
  selectedSeason: string = null;
  seasons$: Observable<SeasonBasicInfo[]>;
  subscriptions = new Subscription();
  teamInfo: any;

  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromApp.AppState>,
    private paymentServ: PaymentService,
    private snackServ: SnackbarService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(this.paymentServ.getLoadingStatus().subscribe((status) => {
      this.loadingStatus = status;
    }));
    this.subscriptions.add(this.store.select('team').pipe(take(1)).subscribe((data) => {
      this.teamInfo = data;
      this.hasTeam = data && data.basicInfo.captainId && data.basicInfo.tname ? true : false;
    }));
    this.getSeasonOrders()
    this.getSeasons()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSeasonOrders() {
    const uid = localStorage.getItem('uid');
    this.subscriptions.add(
      this.ngFire.collection('seasonOrders', (query) => query.where('by', '==', uid)).snapshotChanges()
        .subscribe((res) => {
          if (res.length) {
            this.participatedTournaments = res.map(
              (doc) => (doc.payload.doc.data() as OrderBasic).itemsDescSnap.prodId
            );
          } else {
            this.participatedTournaments = [];
          }
        })
    );
  }
  getSeasons() {
    this.seasons$ = this.ngFire.collection('seasons').snapshotChanges()
      .pipe(
        map((resp) => {
          const seasons: SeasonBasicInfo[] = [];
          resp.forEach(doc => {
            const data = doc.payload.doc.data() as SeasonBasicInfo;
            const id = doc.payload.doc.id;
            if (data.status !== 'FINISHED') {
              seasons.push({ id, ...data } as SeasonBasicInfo);
            }
          })
          return seasons;
        }
        ),
        share()
      );
  }
  async onPayNow(season: SeasonBasicInfo): Promise<any> {
    if (!season.id) {
      return;
    }
    this.selectedSeason = season.name;
    const teamInfo = await this.store.select('team').pipe(take(1)).toPromise();
    const uid = localStorage.getItem('uid');
    if (teamInfo && teamInfo.basicInfo && teamInfo.basicInfo.captainId && teamInfo.basicInfo.tname) {
      if (uid === teamInfo.basicInfo.captainId && teamInfo.teamMembers.memCount >= 8) {
        this.paymentServ.onLoadingStatusChange('loading');
        const isSlotEmpty: boolean = await this.isSlotEmpty(season.p_teams, season.id);
        if (isSlotEmpty) {
          this.initPayment(season, teamInfo.basicInfo.id);
        } else {
          this.snackServ.displayCustomMsg('Participation is full!');
          this.paymentServ.onLoadingStatusChange('home');
        }
        return;
      } else if (uid === teamInfo.basicInfo.captainId && teamInfo.teamMembers.memCount < 8) {
        this.snackServ.displayCustomMsg('Not enough players in Team!');
        return;
      }
      this.snackServ.displayCustomMsg('Please contact your team captain!');
      return;
    } else {
      this.snackServ.displayCustomMsg('Join or Create a team to participate!');
      return;
    }
  }
  initPayment(season: SeasonBasicInfo, teamId: string): void {
    this.paymentServ
      .generateOrder(season.feesPerTeam)
      .then((res) => {
        if (res) {
          this.paymentServ.onLoadingStatusChange('home');
          this.paymentServ.openCheckoutPage(res.id, season, teamId);
        }
      })
      .catch(() => {
        this.paymentServ.onLoadingStatusChange('home');
        this.snackServ.displayError();
      });
  }
  async isSlotEmpty(maxTeams: number, sid: string): Promise<boolean> {
    const participants: SeasonParticipants[] = (await this.ngFire.collection('seasons').doc(sid).collection('participants').get().toPromise()).docs.map((doc) => doc.data() as SeasonParticipants);
    if (participants.length < maxTeams) {
      return true;
    }
  }
  goToSeason(name?: string): void {
    this.paymentServ.onLoadingStatusChange('home');
    if (name) {
      this.router.navigate(['/s', name])
    }
  }
  isParticipated(seasonid: string): boolean {
    return this.participatedTournaments.includes(seasonid);
  }
  getContainingTournaments(list: string[]) {
    return list.length ? list.join(', ') : "NA";
  }
}
