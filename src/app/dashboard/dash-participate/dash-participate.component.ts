import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, share, take } from 'rxjs/operators';
import { ICheckoutOptions, PaymentService, PAYMENT_TYPE } from '@shared/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { OrderTypes, RazorPayOrder, userOrder } from '@shared/interfaces/order.model';
import { SeasonAbout, SeasonBasicInfo } from '@shared/interfaces/season.model';
import { HOME, LOADING, SUCCESS, } from '../constants/constants';
import * as fromApp from '../../store/app.reducer';
import { Router } from '@angular/router';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { CTAButtonPaymentOption, IPaymentOptions, PaymentOptionsDialogComponent } from '@shared/dialogs/payment-options-dialog/payment-options-dialog.component';
import { environment } from 'environments/environment';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SEASON_OFFERS_MORE_INFO } from '@shared/web-content/WEBSITE_CONTENT';
import { AGE_CATEGORY, Formatters, TeamMoreInfo } from '@shared/interfaces/team.model';
import { EnlargeService } from '@app/services/enlarge.service';

export enum OperationStatus {
  default,
  success,
  loading,
  failure
}
@Component({
  selector: 'app-dash-participate',
  templateUrl: './dash-participate.component.html',
  styleUrls: ['./dash-participate.component.scss'],
})
export class DashParticipateComponent implements OnInit, OnDestroy {

  readonly statusEnum = OperationStatus;

  teamID: string = null;
  isUserAllowedParticipation = false;
  seasons: SeasonBasicInfo[] = [];
  ordersList: userOrder[] = [];
  subscriptions = new Subscription();
  status = OperationStatus.default;
  formatter = Formatters

  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromApp.AppState>,
    private paymentService: PaymentService,
    private snackBarService: SnackbarService,
    private dialog: MatDialog,
    private enlargeService: EnlargeService
  ) { }

  ngOnInit(): void {
    this.getSeasons();
    this.getUserOrders();
    this.getTeamInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeamInfo() {
    this.subscriptions.add(this.store.select('team').pipe(take(1)).subscribe((data) => {
      const uid = localStorage.getItem('uid');
      if (data?.basicInfo?.tname) {
        this.teamID = data?.basicInfo?.id;
        this.isUserAllowedParticipation = data.basicInfo.captainId === uid && data.teamMembers.members.length >= ProfileConstants.MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT;
      } else {
        this.teamID = null;
        this.isUserAllowedParticipation = false;
      }
    }));
  }

  getSeasons() {
    this.status = OperationStatus.loading;
    this.ngFire.collection('seasons').snapshotChanges()
      .pipe(
        map((resp) => {
          if (resp) {
            const seasons: SeasonBasicInfo[] = [];
            resp.forEach(doc => {
              const data = doc.payload.doc.data() as SeasonBasicInfo;
              const id = doc.payload.doc.id;
              const discountedFees = this.paymentService.getFeesAfterDiscount(data.feesPerTeam, data.discount);
              if (data.status === 'PUBLISHED' || data.status === 'CANCELLED') {
                seasons.push({ id, ...data, discountedFees } as SeasonBasicInfo);
              }
            });
            return seasons.sort(ArraySorting.sortObjectByKey('lastRegDate', 'desc'));
          }
          return [];
        }
        ),
      )
      .subscribe({
        next: (response) => {
          this.status = OperationStatus.default;
          if (response) {
            this.seasons = response;
          }
        },
        error: () => {
          this.snackBarService.displayError('Error getting seasons!');
          this.status = OperationStatus.default;
        }
      });
  }

  getUserOrders() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.subscriptions.add(
        this.ngFire.collection('orders', (query) => query.where('by', '==', uid).where('type', '==', OrderTypes.season)).get()
          .subscribe((res) => {
            this.ordersList = !res.empty ? res.docs.map(el => el.data() as userOrder) : [];
          })
      );
    }
  }

  async openOffers(season: SeasonBasicInfo): Promise<void> {
    this.isSeasonEntryValid(season)
      .then(() => {
        const data = this.getOffersData(season);
        const dialogRef = this.dialog.open(PaymentOptionsDialogComponent, {
          panelClass: 'large-dialogs',
          data
        });

        dialogRef.afterClosed()
          .subscribe((response: CTAButtonPaymentOption) => {
            if (response && !isNaN(response.amount) && response.amount > 0) {
              this.initCheckoutFlow(season, response);
            } else if (response?.amount === 0) {
              this.participateInFreeSeason(season);
            }
          })
      })
      .catch(() => { })
  }

  initCheckoutFlow(seasonInfo: SeasonBasicInfo, selection: CTAButtonPaymentOption) {
    this.status = OperationStatus.loading;
    const totalAmount = this.paymentService.getFeesAfterDiscount(seasonInfo.feesPerTeam, seasonInfo.discount);
    const partialAmount = selection.isPartial ? selection.amount : null;
    this.paymentService.generateOrder(totalAmount, partialAmount)
      .then(this.parseGeneratedOrder.bind(this, totalAmount, partialAmount))
      .catch(this.handleOrderGenerationError.bind(this))

  }

  parseGeneratedOrder(totalAmount: number, partialAmount: number, order: RazorPayOrder) {
    this.status = OperationStatus.default;
    const options: ICheckoutOptions = {
      ...UNIVERSAL_OPTIONS,
      amount: totalAmount,
    }
    if (totalAmount !== partialAmount) {

    }
  }

  handleOrderGenerationError() {
    this.status = OperationStatus.default;
    this.snackBarService.displayError('Error generating order from Razorpay! Try again later')
  }

  getOffersData(season: SeasonBasicInfo) {
    const fees = this.paymentService.getFeesAfterDiscount(season.feesPerTeam, season.discount);
    const expiryOffer = season.start_date - MatchConstants.ONE_HOUR_IN_MILLIS;
    const options: IPaymentOptions[] = [];
    const offerPercent = 10;
    const amount1 = (offerPercent / 100) * fees;
    const amount2 = fees - amount1;
    options.push({
      subheading: `Pay ${offerPercent}% of the total participation fees & pay rest on the field before tournament start`,
      cta: [
        {
          primary: true,
          text: `Book Now @ Rs.${amount1}`,
          disabled: fees > 0,
          amount: amount1,
          isPartial: true
        },
        {
          primary: false,
          text: `Pay Remaining Fee (Rs.${amount2})`,
          disabled: true,
          amount: amount2,
          isPartial: true
        }
      ],
      offerExpiry: expiryOffer,
      offerText: 'Offer ends soon',
      readMoreData: {
        heading: 'Applicable Offers',
        description: SEASON_OFFERS_MORE_INFO
      },
    })

    const discount = 15;
    const amount = discount / 100 * fees;
    options.push({
      subheading: `Pay full participation fees & get ${discount}% discount`,
      cta: [
        {
          primary: true,
          text: `Participate @Rs.${amount} `,
          disabled: fees > 0,
          amount,
          isPartial: false
        },
      ],
      offerExpiry: expiryOffer,
      offerText: 'Offer ends soon',
      readMoreData: {
        heading: 'Applicable Offers',
        description: SEASON_OFFERS_MORE_INFO
      },
    })
    return options;
  }

  async participateInFreeSeason(season: SeasonBasicInfo): Promise<void> {
    this.dialog.open(ConfirmationBoxComponent).afterClosed()
      .subscribe(response => {
        if (response) {
          this.status = OperationStatus.loading;
          this.paymentService.participate(season, this.teamID)
            .subscribe({
              next: () => {
                this.snackBarService.displayCustomMsg('Season participation is successful!');
                this.status = OperationStatus.success;
              },
              error: (error) => {
                this.status = OperationStatus.default;
                this.snackBarService.displayError(error?.message)
              },
            })
        }
      })
  }

  async isSeasonEntryValid(season: SeasonBasicInfo): Promise<void> {
    if (!this.isUserAllowedParticipation) {
      this.snackBarService.displayError('Only team captains can make payments for the team');
      return Promise.reject();
    } else if (season.status !== 'PUBLISHED') {
      this.snackBarService.displayError('Season is either cancelled or finished');
      return Promise.reject();
    } else if ((await this.isTeamNotAllowed(season.id))) {
      this.snackBarService.displayError('Participation is restricted to certain teams');
      return Promise.reject();
    } else if ((await this.isTeamInvalidAgeGroup(season.ageCategory))) {
      this.snackBarService.displayError('Your team age category is not allowed!');
      return Promise.reject();
    } else if ((await this.isTeamParticipant(season.id))) {
      this.snackBarService.displayError('Team is already a participant');
      return Promise.reject();
    } else if ((await this.isParticipationUnavailable(season.id, season.p_teams))) {
      this.snackBarService.displayError('All Participation slots are filled!');
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  }

  async isTeamParticipant(seasonID: string): Promise<boolean> {
    if (seasonID && this.teamID) {
      return (await this.ngFire.collection(`seasons/${seasonID}/participants`, query => query.where('tid', '==', this.teamID)).get().toPromise()).empty === false;
    }
    return false;
  }

  async isTeamInvalidAgeGroup(compareAgeCat: AGE_CATEGORY) {
    if (compareAgeCat === 99) {
      return false;
    } else if (this.teamID) {
      return ((await this.ngFire.collection(`teams/${this.teamID}/additionalInfo`).doc('moreInfo').get().toPromise()).data() as TeamMoreInfo).tageCat !== compareAgeCat
    }
    return false;
  }

  async isParticipationUnavailable(seasonID: string, maxCapacity: number): Promise<boolean> {
    if (seasonID && this.teamID) {
      return (await this.ngFire.collection(`seasons/${seasonID}/participants`).get().toPromise()).size >= maxCapacity;
    }
    return false;
  }

  async isTeamNotAllowed(seasonID: string): Promise<boolean> {
    if (seasonID && this.teamID) {
      const moreInfo = ((await this.ngFire.collection(`seasons/${seasonID}/additionalInfo`).doc('moreInfo').get().toPromise()).data() as SeasonAbout);
      if (moreInfo.hasOwnProperty('allowedParticipants') && !moreInfo.allowedParticipants.includes(this.teamID)) {
        return true;
      }
      return false;
    }
    return false;
  }

  goToSeason(season: string): void {
    window.open(environment.firebase.url + '/s/' + season, '_blank');
  }

  enlargePhoto(url: string) {
    this.enlargeService.onOpenPhoto(url)
  }
}
