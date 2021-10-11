import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import * as fromDash from '../store/dash.reducer';
@Component({
  selector: 'app-dash-participate',
  templateUrl: './dash-participate.component.html',
  styleUrls: ['./dash-participate.component.css'],
})
export class DashParticipateComponent implements OnInit, OnDestroy {
  seasons$: Observable<SeasonBasicInfo[]>;
  subscriptions = new Subscription();
  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromDash.DashState>,
    private paymentServ: PaymentService,
    private snackServ: SnackbarService
  ) {}
  ngOnInit(): void {
    this.seasons$ = this.ngFire
      .collection('seasons', (query) =>
        query.where('cont_tour', 'array-contains', 'FKC')
      )
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...(doc.data() as SeasonBasicInfo),
              } as SeasonBasicInfo)
          )
        )
      );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onPayNow(seasonid: string): void {
    if (seasonid) {
      this.subscriptions.add(
        this.store
          .select('hasTeam')
          .pipe(take(1))
          .subscribe((hasTeam) => {
            if (hasTeam) {
              const uid = localStorage.getItem('uid');
              if (uid === hasTeam.capId) {
                this.paymentServ.onInitiatePayment();
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
      );
    }
  }
}
