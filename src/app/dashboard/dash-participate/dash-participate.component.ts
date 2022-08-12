import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, share, take, tap } from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UNIVERSAL_TOURNAMENT_FEES } from 'src/app/shared/Constants/RAZORPAY';
import { OrderBasic } from 'src/app/shared/interfaces/order.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { T_LOADING, T_HOME, T_SUCCESS, T_FAILURE, HOME, LOADING, SUCCESS, } from '../constants/constants';
import * as fromApp from '../../store/app.reducer';
@Component({
  selector: 'app-dash-participate',
  templateUrl: './dash-participate.component.html',
  styleUrls: ['./dash-participate.component.css'],
})
export class DashParticipateComponent implements OnInit, OnDestroy {
  readonly SUCCESS = SUCCESS;
  readonly LOADING = LOADING;
  readonly HOME = HOME;
  selectedSeason: string = null;
  seasons$: Observable<SeasonBasicInfo[]>;
  subscriptions = new Subscription();
  loadingStatus: T_HOME | T_LOADING | T_SUCCESS | T_FAILURE = HOME;
  participatedTournaments: string[];
  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromApp.AppState>,
    private paymentServ: PaymentService,
    private snackServ: SnackbarService
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(
      this.paymentServ.getLoadingStatus().subscribe((status) => {
        this.loadingStatus = status;
      })
    );
    const uid = localStorage.getItem('uid');
    this.subscriptions.add(
      this.ngFire
        .collection('seasonOrders', (query) => query.where('by', '==', uid))
        .get()
        .subscribe((res) => {
          if (!res.empty) {
            this.participatedTournaments = res.docs.map(
              (doc) => (doc.data() as OrderBasic).itemsDescSnap.prodId
            );
          } else {
            this.participatedTournaments = [];
          }
        })
    );
    this.seasons$ = this.ngFire
      .collection('seasons')
      .snapshotChanges()
      .pipe(
        map((resp) =>
          resp.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as SeasonBasicInfo),
            } as SeasonBasicInfo)
          )
        ),
        share()
      );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onPayNow(season: SeasonBasicInfo): void {
    this.paymentServ.onLoadingStatusChange('loading');
    this.selectedSeason = season.name;
    if (season.id) {
      this.subscriptions.add(
        this.store
          .select('team')
          .pipe(
            take(1),
            tap((team) => {
              if (team.basicInfo) {
                const uid = localStorage.getItem('uid');
                if (uid === team.basicInfo.captainId) {
                  if (team.teamMembers.memCount !== 8) {
                    this.snackServ.displayCustomMsg(
                      'Not enough players in Team!'
                    );
                  } else {
                    this.initPayment(
                      season,
                      season.feesPerTeam,
                      team.basicInfo.id
                    );
                  }
                } else {
                  this.snackServ.displayCustomMsg(
                    'Please contact your team captain!'
                  );
                }
              } else {
                this.snackServ.displayCustomMsg(
                  'Join or Create a team to participate!'
                );
              }
            })
          )
          .subscribe()
      );
    }
  }
  initPayment(season: SeasonBasicInfo, fees: number, teamId: string): void {
    this.paymentServ
      .generateOrder(fees ? fees : UNIVERSAL_TOURNAMENT_FEES)
      .then((res) => {
        if (res) {
          this.paymentServ.onLoadingStatusChange('home');
          this.paymentServ.openCheckoutPage(res.id, fees, season, teamId);
        }
      })
      .catch(() => {
        this.paymentServ.onLoadingStatusChange('home');
        this.snackServ.displayError();
      });
  }
  onExitScreen(): void {
    this.paymentServ.onLoadingStatusChange('home');
  }
  isParticipated(seasonid: string): boolean {
    return this.participatedTournaments.includes(seasonid);
  }
}
