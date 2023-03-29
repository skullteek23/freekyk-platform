import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { ICheckoutOptions, PaymentService, } from '@shared/services/payment.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { OrderTypes, RazorPayOrder } from '@shared/interfaces/order.model';
import { SeasonAbout, SeasonBasicInfo } from '@shared/interfaces/season.model';
import * as fromApp from '../../store/app.reducer';
import { MatchConstants, ProfileConstants } from '@shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { CTAButtonPaymentOption, IPaymentOptions, PaymentOptionsDialogComponent } from '@shared/dialogs/payment-options-dialog/payment-options-dialog.component';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { SEASON_OFFERS_MORE_INFO } from '@shared/web-content/WEBSITE_CONTENT';
import { Formatters, TeamMoreInfo } from '@shared/interfaces/team.model';
import { EnlargeService } from '@app/services/enlarge.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';

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
export class DashParticipateComponent implements OnInit {

  readonly statusEnum = OperationStatus;

  teamID: string = null;
  seasons: SeasonBasicInfo[] = [];
  ordersList: Partial<RazorPayOrder>[] = [];
  status = OperationStatus.default;
  formatter = Formatters;
  selectedSeason: SeasonBasicInfo = null;
  selectedSeasonID: string = null;

  constructor(
    private ngFire: AngularFirestore,
    private store: Store<fromApp.AppState>,
    private paymentService: PaymentService,
    private snackBarService: SnackbarService,
    private dialog: MatDialog,
    private enlargeService: EnlargeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.selectedSeasonID = this.route.snapshot.params['season'];
    this.getSeasons();
  }

  getSeasons() {
    const uid = localStorage.getItem('uid');
    this.status = OperationStatus.loading;
    forkJoin([
      this.ngFire.collection('seasons').get(),
      this.ngFire.collection('orders', (query) => query.where('receipt', '==', uid)).get()
    ]).subscribe({
      next: (response) => {
        if (response && response.length === 2) {
          this.ordersList = response[1].docs.map(el => ({ id: el.id, ...el.data() as Partial<RazorPayOrder> }));
          const list = response[0].docs.map(season => {
            const docData = season.data() as SeasonBasicInfo;
            const docID = season.id;
            const slotExists = this.ordersList.find(order => order.seasonID === docID);

            docData.discountedFees = this.paymentService.getFeesAfterDiscount(docData.feesPerTeam, docData.discount);
            if (slotExists) {
              docData.slotBooked = true;
              docData.isAmountDue = slotExists.amount_due / 100; // in rupees
            } else {
              docData.slotBooked = false;
              docData.isAmountDue = null;
            }
            docData.isFreeSeason = docData.discountedFees === 0;

            return { id: docID, ...docData };
          });
          this.seasons = list.filter(season => season.status !== 'REMOVED' && season.status !== 'FINISHED');
          this.seasons.sort(ArraySorting.sortObjectByKey('isAmountDue', 'desc'));
        } else {
          this.ordersList = [];
          this.seasons = [];
        }
        this.status = OperationStatus.default;

        if (this.selectedSeasonID && this.seasons.length && this.ordersList.length) {
          const season = this.seasons.find(s => s.id === this.selectedSeasonID);
          this.initCheckoutFlow(season);
        }
      },
      error: () => {
        this.snackBarService.displayError('Error getting seasons!');
        this.status = OperationStatus.default;
      }
    });
  }

  initCheckoutFlow(season: SeasonBasicInfo) {
    this.selectedSeason = season;
    this.status = OperationStatus.loading;
    this.isSeasonEntryValid(season)
      .then(() => {
        const order = this.ordersList.find(or => or.seasonID === season.id);
        if (order) {
          this.openPartialPaymentPage(order.id, order.amount_due);
        } else {
          this.paymentService.generateOrder(season.discountedFees, MatchConstants.MINIMUM_PAYMENT_AMOUNT)
            .then(this.openNewCheckoutPage.bind(this, season.discountedFees))
            .catch(this.onErrorOrderGeneration.bind(this))
        }
      })
      .catch(() => {
        this.status = OperationStatus.default;
        this.selectedSeason = null;
      })
  }

  openPartialPaymentPage(orderID: string, amountDue: number) {
    const options: Partial<ICheckoutOptions> = {
      ...UNIVERSAL_OPTIONS,
      order_id: orderID,
      amount: amountDue,
      handler: this.handlePartialPaymentSuccess.bind(this),
      modal: {
        backdropclose: false,
        escape: false,
        confirm_close: true,
        ondismiss: this.onClosePaymentPage.bind(this)
      }
    }
    this.paymentService.openCheckoutPage(options);
  }

  openNewCheckoutPage(totalAmount: number, order: Partial<RazorPayOrder>) {
    const options: Partial<ICheckoutOptions> = {
      ...UNIVERSAL_OPTIONS,
      order_id: order.id,
      amount: totalAmount * 100,
      handler: this.handlePaymentSuccess.bind(this),
      modal: {
        backdropclose: false,
        escape: false,
        confirm_close: true,
        ondismiss: this.onClosePaymentPage.bind(this)
      }
    }
    this.paymentService.openCheckoutPage(options);
  }

  onClosePaymentPage() {
    this.router.navigate(['/dashboard/participate'])
    this.status = OperationStatus.default;
    this.cdr.detectChanges();
  }

  onErrorOrderGeneration() {
    this.status = OperationStatus.default;
    this.snackBarService.displayError('Error generating order from Razorpay! Try again later');
  }

  handlePaymentSuccess(response) {
    this.paymentService.verifyPayment(response)
      .subscribe({
        next: () => {
          const allPromises = [];
          const tid = sessionStorage.getItem('tid');
          // allPromises.push(this.paymentService.saveOrder(this.selectedSeason, OrderTypes.season, response).toPromise());
          allPromises.push(this.paymentService.participate(this.selectedSeason, tid).toPromise());

          Promise.all(allPromises)
            .then(() => {
              this.status = OperationStatus.success;
              this.snackBarService.displayCustomMsg('Your Participation is confirmed!');
            })
            .catch((error) => {
              this.status = OperationStatus.default;
              this.snackBarService.displayError(error.message);
            })
        },
        error: (error) => {
          this.snackBarService.displayError(error?.message);
        }
      });
  }

  handlePartialPaymentSuccess(response) {
    this.paymentService.verifyPayment(response)
      .subscribe({
        next: () => {
          this.paymentService.updateOrder(response).toPromise()
            .then(() => {
              this.status = OperationStatus.success;
              this.snackBarService.displayCustomMsg('Your payment is completed!');
            })
            .catch((error) => {
              this.status = OperationStatus.default;
              this.snackBarService.displayError(error.message);
            })
        },
        error: (error) => {
          this.snackBarService.displayError(error?.message);
        }
      });
  }

  async openOffers(season: SeasonBasicInfo): Promise<void> {
    this.selectedSeason = season;
    this.isSeasonEntryValid(season)
      .then(() => {
        const dialogRef = this.dialog.open(PaymentOptionsDialogComponent, {
          panelClass: 'large-dialogs',
          data: this.getOffersData()
        });

        dialogRef.afterClosed()
          .subscribe((dialogResponse: CTAButtonPaymentOption) => {
            if (dialogResponse?.amount === 0) {
              this.participateInFreeSeason(season);
            }
          })
      })
      .catch(() => {
        this.selectedSeason = null;
      })
  }

  getOffersData() {
    const season = this.selectedSeason;
    const fees = this.paymentService.getFeesAfterDiscount(season.feesPerTeam, season.discount);
    const expiryOffer = season.start_date;
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
          disabled: false,
          amount: amount1,
          isPartial: true
        },
        {
          primary: false,
          text: `Pay Remaining Fee (Rs.${amount2})`,
          disabled: false,
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
    const amount = fees - (discount / 100 * fees);
    options.push({
      subheading: `Pay full participation fees & get ${discount}% additional discount`,
      cta: [
        {
          primary: true,
          text: `Participate @Rs.${amount} `,
          disabled: false,
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

  onNavigateToFixtures() {
    this.router.navigate(['/s', this.selectedSeason.id]);
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
    if (await this.isUserNotCaptain()) {
      this.snackBarService.displayCustomMsg('Only team captains can make payments for the team');
      return Promise.reject();
    } else if (await this.isMembersNotEligible()) {
      this.snackBarService.displayError(`Minimum players needed: ${ProfileConstants.MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT}`);
      return Promise.reject();
    } else if ((await this.isTeamNotAllowed())) {
      this.snackBarService.displayError('Participation is restricted to certain teams');
      return Promise.reject();
    } else if ((await this.isTeamInvalidAgeGroup())) {
      this.snackBarService.displayError('Your team age category is not allowed!');
      return Promise.reject();
    } else if ((await this.isTeamParticipant())) {
      this.snackBarService.displayError('Team is already a participant');
      return Promise.reject();
    } else if ((await this.isParticipationUnavailable())) {
      this.snackBarService.displayError('All Participation slots are filled!');
      return Promise.reject();
    } else if (this.isSeasonCancelled()) {
      this.snackBarService.displayCustomMsg('Season is cancelled by the organizer!');
      return Promise.reject();
    } else if (this.isSeasonFinished()) {
      this.snackBarService.displayCustomMsg('Season is finished!');
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  }

  isSeasonCancelled() {
    return this.selectedSeason?.status === 'CANCELLED';
  }

  isSeasonFinished() {
    return this.selectedSeason?.status === 'FINISHED';
  }

  async getTeamInfo() {
    return await this.store.select('team').pipe(take(1)).toPromise();
  }

  async isUserNotCaptain(): Promise<boolean> {
    const info = await this.getTeamInfo();
    const uid = localStorage.getItem('uid');
    if (uid && info) {
      return info?.basicInfo?.captainId !== uid;
    }
    return true;
  }

  async isMembersNotEligible(): Promise<boolean> {
    const info = await this.getTeamInfo();
    const uid = localStorage.getItem('uid');
    if (uid && info) {
      return info.teamMembers.members.length < ProfileConstants.MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT;
    }
    return true;
  }

  async isTeamParticipant(): Promise<boolean> {
    if (this.selectedSeason?.id && this.teamID) {
      return (await this.ngFire.collection(`seasons/${this.selectedSeason?.id}/participants`, query => query.where('tid', '==', this.teamID)).get().toPromise()).empty === false;
    }
    return false;
  }

  async isTeamInvalidAgeGroup() {
    if (this.selectedSeason?.ageCategory === 99) {
      return false;
    } else if (this.teamID) {
      return ((await this.ngFire.collection(`teams/${this.teamID}/additionalInfo`).doc('moreInfo').get().toPromise()).data() as TeamMoreInfo).tageCat !== this.selectedSeason?.ageCategory
    }
    return false;
  }

  async isParticipationUnavailable(): Promise<boolean> {
    if (this.selectedSeason && this.teamID) {
      return (await this.ngFire.collection(`seasons/${this.selectedSeason.id}/participants`).get().toPromise()).size >= this.selectedSeason.p_teams;
    }
    return false;
  }

  async isTeamNotAllowed(): Promise<boolean> {
    if (this.selectedSeason?.id && this.teamID) {
      const moreInfo = ((await this.ngFire.collection(`seasons/${this.selectedSeason?.id}/additionalInfo`).doc('moreInfo').get().toPromise()).data() as SeasonAbout);
      if (moreInfo.hasOwnProperty('allowedParticipants') && !moreInfo.allowedParticipants.includes(this.teamID)) {
        return true;
      }
      return false;
    }
    return false;
  }

  enlargePhoto(url: string) {
    this.enlargeService.onOpenPhoto(url)
  }
}
