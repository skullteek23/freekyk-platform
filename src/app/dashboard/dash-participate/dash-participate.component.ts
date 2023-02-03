import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, share, take } from 'rxjs/operators';
import { ICheckoutOptions, PaymentService, PAYMENT_TYPE } from '@shared/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { OrderBasic } from '@shared/interfaces/order.model';
import { SeasonAbout, SeasonBasicInfo } from '@shared/interfaces/season.model';
import { HOME, LOADING, SUCCESS, } from '../constants/constants';
import * as fromApp from '../../store/app.reducer';
import { Router } from '@angular/router';
import { ArraySorting } from '@shared/utils/array-sorting';
import { ProfileConstants } from '@shared/constants/constants';
@Component({
  selector: 'app-dash-participate',
  templateUrl: './dash-participate.component.html',
  styleUrls: ['./dash-participate.component.scss'],
})
export class DashParticipateComponent implements OnInit, OnDestroy {

  readonly SUCCESS = SUCCESS;
  readonly LOADING = LOADING;
  readonly HOME = HOME;

  hasTeam = true;
  loadingStatus: PAYMENT_TYPE = HOME;
  participatedTournaments: string[] = [];
  selectedSeason: string = null;
  seasons$: Observable<SeasonBasicInfo[]>;
  subscriptions = new Subscription();
  teamInfo: any;

  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromApp.AppState>,
    private paymentServ: PaymentService,
    private snackBarService: SnackbarService,
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
    this.getSeasonOrders();
    this.getSeasons();
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
    const currentTimestamp = new Date().getTime();
    this.seasons$ = this.ngFire.collection('seasons').snapshotChanges()
      // this.seasons$ = this.ngFire.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).snapshotChanges()
      .pipe(
        map((resp) => {
          const seasons: SeasonBasicInfo[] = [];
          resp.forEach(doc => {
            const data = doc.payload.doc.data() as SeasonBasicInfo;
            const id = doc.payload.doc.id;
            if (data.status === 'PUBLISHED' || data.status === 'CANCELLED') {
              seasons.push({ id, ...data } as SeasonBasicInfo);
            }
          });
          return seasons.sort(ArraySorting.sortObjectByKey('lastRegDate', 'desc'));
        }
        ),
        share()
      );
  }

  async onPayNow(season: SeasonBasicInfo): Promise<any> {
    if (!season.id) {
      return;
    } else if (season.status === 'CANCELLED') {
      this.snackBarService.displayError('Season is cancelled!');
      return;
    }
    this.selectedSeason = season.name;
    const teamInfo = await this.store.select('team').pipe(take(1)).toPromise();
    const uid = localStorage.getItem('uid');
    const restrictedParticipants: string[] = await this.getParticipantsInfo(season.id);
    const isAvailableSlot: boolean = await this.isAvailableSlot(season.p_teams, season.id);
    let errorMessage = '';
    if (!teamInfo || !teamInfo.basicInfo || !teamInfo.basicInfo.tname) {
      errorMessage = 'Join or Create a team to participate!';
    } else if (!teamInfo || !teamInfo.teamMembers || teamInfo.teamMembers.memCount < ProfileConstants.MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT) {
      errorMessage = `Minimum ${ProfileConstants.MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT} players needed to perform this action!`;
    } else if (!uid || !teamInfo.basicInfo || uid !== teamInfo.basicInfo.captainId) {
      errorMessage = 'Only captains are allowed to make payment!';
    } else if (restrictedParticipants && restrictedParticipants.includes(teamInfo?.basicInfo?.id) === false) {
      errorMessage = 'Participants are restricted!';
    } else if (!isAvailableSlot) {
      errorMessage = 'Participation is full!';
    } else {
      this.paymentServ.onLoadingStatusChange('loading');
      this.initPayment(season, teamInfo.basicInfo.id);
    }
    if (errorMessage) {
      this.snackBarService.displayError(errorMessage);
      this.paymentServ.onLoadingStatusChange('home');
    }
  }

  initPayment(season: SeasonBasicInfo, teamId: string): void {
    // minimum fees
    const fees = this.paymentServ.getFeesAfterDiscount(season.feesPerTeam, season.discount);
    this.paymentServ
      .generateOrder(fees, 300)
      .then((res) => {
        if (res) {
          const options: ICheckoutOptions = this.paymentServ.getCaptainCheckoutOptions(fees.toString(), season, teamId);
          options.order_id = res['id'];
          options.failureRoute = '/dashboard/error';
          this.paymentServ.openCheckoutPage(options);
        }
        this.paymentServ.onLoadingStatusChange('home');
      })
      .catch((err) => {
        this.paymentServ.onLoadingStatusChange('home');
        this.snackBarService.displayError();
      });
  }

  async isAvailableSlot(maxTeams: number, sid: string): Promise<boolean> {
    return (await this.ngFire.collection('seasons').doc(sid).collection('participants').get().toPromise()).docs.length < maxTeams;
  }

  async getParticipantsInfo(sid: string): Promise<string[]> {
    const data = (await this.ngFire.collection('seasons').doc(sid).collection('additionalInfo').doc('moreInfo').get().toPromise()).data() as SeasonAbout;
    return data?.allowedParticipants?.length > 0 ? data?.allowedParticipants : null;
  }

  goToSeason(name?: string): void {
    this.paymentServ.onLoadingStatusChange('home');
    if (name) {
      this.router.navigate(['/s', name]);
    }
  }

  isParticipated(seasonid: string): boolean {
    return this.participatedTournaments.includes(seasonid);
  }

  getContainingTournaments(list: string[]) {
    return list.length ? list.join(', ') : 'NA';
  }
}
