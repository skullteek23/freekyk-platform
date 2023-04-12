import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { MatchFixture } from '@shared/interfaces/match.model';
import { OrderTypes } from '@shared/interfaces/order.model';
import { ListOption } from '@shared/interfaces/others.model';
import { Formatters } from '@shared/interfaces/team.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { ICheckoutOptions, PaymentService } from '@shared/services/payment.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { WaitingListDialogComponent } from '../waiting-list-dialog/waiting-list-dialog.component';

export interface ISlotOption {
  booked: boolean;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-pickup-game-profile',
  templateUrl: './pickup-game-profile.component.html',
  styleUrls: ['./pickup-game-profile.component.scss']
})
export class PickupGameProfileComponent implements OnInit {

  readonly customDateFormat = MatchConstants.GROUND_SLOT_DATE_FORMAT;
  readonly oneHourMilliseconds = 3600000;

  readonly ONE_SIDE_COUNT = 7;

  subscriptions = new Subscription();
  seasonID: string = null;
  season: Partial<SeasonAllInfo> = null;
  isLoaderShown = false;
  startDate = '';
  match: MatchFixture;
  ground: ListOption;
  ageCatFormatter: any;
  displayedSlots: ISlotOption[] = [];
  allSlots: IPickupGameSlot[] = [];
  reportingTime: number = null;
  payableFees = 0;
  emptySlotsCount = 0;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private router: Router,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackbarService,
    private apiPostService: ApiPostService
  ) { }

  ngOnInit(): void {
    this.ageCatFormatter = Formatters;
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('seasonid')) {
          this.seasonID = params['seasonid'];
          this.getSeasonInfo();
        }
      }
    }));
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && event?.url?.endsWith('/pay')) {
        this.participate();
      } else if (event instanceof NavigationEnd && event?.url?.endsWith('/waiting-list')) {
        this.openWaitingList();
      }
    }));
  }

  getSeasonInfo(): void {
    if (this.seasonID) {
      this.showLoader();
      this.apiService.getSeasonAllInfo(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.season = response;
              this.seasonID = response.id;
              this.createStartDate();
              this.getSeasonMatches();
              this.getSeasonBookedSlots();
              this.reportingTime = this.season.startDate - (MatchConstants.ONE_HOUR_IN_MILLIS / 4);
              this.payableFees = 0;
            } else {
              this.router.navigate(['error'])
            }
            this.hideLoader();
            window.scrollTo(0, 0);
          },
          error: (error) => {
            this.season = null;
            this.hideLoader();
            window.scrollTo(0, 0);
            this.router.navigate(['/error']);
          }
        })
    }
  }

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  redirectToUrl(path: string, encodePath: string): void {
    const encodedString = encodeURIComponent(encodePath);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  getSeasonMatches() {
    if (this.season?.name) {
      this.apiService.getSeasonMatches(this.season.name)
        .subscribe({
          next: (response) => {
            if (response) {
              this.match = response[0];
              this.ground = { viewValue: this.match.ground, value: this.match.groundID }
            }
          },
          error: (error) => {
            this.match = null;
            this.ground = null;
          }
        })
    }
  }

  getSeasonBookedSlots() {
    if (this.seasonID) {
      this.apiService.getSeasonBookedSlotsWithNames(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.allSlots = response;
            }
            this.createBookedSlotList();
          },
          error: () => {
            this.allSlots = [];
            this.createBookedSlotList();
          }
        })
    }
  }

  createStartDate() {
    if (this.season?.startDate) {
      const today = new Date().getTime();
      const timeDiff = Math.abs(this.season.startDate - today);
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays === 0) {
        this.startDate = 'today';
      } else if (diffDays === 1) {
        this.startDate = 'tomorrow';
      } else {
        this.startDate = `in ${diffDays} days`;
      }
    }
  }

  selectSlot(slot: ISlotOption) {
    if (slot.booked) {
      return;
    }
    if (!slot.selected) {
      slot.selected = true;
      this.payableFees += this.season.fees;
    } else {
      slot.selected = false;
      this.payableFees -= this.season.fees;
    }
  }

  createBookedSlotList() {
    this.displayedSlots = [];
    this.emptySlotsCount = 0;
    for (let i = 0; i < 14; i++) {
      if (this.allSlots.hasOwnProperty(i)) {
        for (let j = 0; j < this.allSlots[i].slots; j++) {
          if (this.displayedSlots.findIndex(el => el.name === this.allSlots[i].name) > -1) {
            this.displayedSlots.push({
              name: `${this.getShortenText(this.allSlots[i].name, 8)} +${j}`,
              booked: true,
              selected: false
            })
          } else {
            this.displayedSlots.push({
              name: this.allSlots[i].name,
              booked: true,
              selected: false
            })
          }
        }
      } else if (this.displayedSlots.length < 14) {
        this.displayedSlots.push({
          name: '',
          booked: false,
          selected: false
        })

      }
    }
    this.emptySlotsCount = this.displayedSlots.filter(el => !el.name).length;
  }

  getShortenText(value: string, maxLength: number): string {
    if (!!value) {
      return value.length > maxLength
        ? value.slice(0, maxLength).concat('...')
        : value;
    }
    return value;
  }

  getStarted() {
    this.showLoader();
    this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/pay`);
  }

  participate() {
    this.authService.isLoggedIn().subscribe({
      next: async (user) => {
        if (user && this.payableFees > 0) {
          this.showLoader();
          const order = await this.paymentService.getNewOrder(user.uid, this.payableFees.toString());
          const options: Partial<ICheckoutOptions> = {
            ...UNIVERSAL_OPTIONS,
            order_id: order.id,
            amount: this.payableFees * 100,
            handler: this.handlePaymentSuccess.bind(this),
            modal: {
              backdropclose: false,
              escape: false,
              confirm_close: true,
              ondismiss: this.dismissDialog.bind(this)
            }
          }
          this.paymentService.openCheckoutPage(options);
        } else {
          this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/pay`);
        }
      }
    })
  }

  handlePaymentSuccess(response): void {
    this.showLoader();
    if (response) {
      this.paymentService.verifyPayment(response)
        .subscribe({
          next: () => {
            const allPromises = [];
            allPromises.push(this.paymentService.saveOrder(this.seasonID, OrderTypes.season, response).toPromise());
            allPromises.push(this.updatePickupSlot(response['razorpay_order_id']));

            Promise.all(allPromises)
              .then(() => {
                this.snackBarService.displayCustomMsg('Your slot has been booked!');
              })
              .catch((error) => {
                this.snackBarService.displayError(error?.message);
              })
              .finally(() => {
                this.getSeasonInfo();
                this.hideLoader();
              })
          },
          error: (error) => {
            this.hideLoader();
            this.snackBarService.displayError(error?.message);
          }
        });
    } else {
      this.hideLoader();
      this.snackBarService.displayError();
    }
  }

  updatePickupSlot(orderID: string) {
    const totalSlots = this.displayedSlots.filter(el => el.selected).length;
    const existingSlot = this.allSlots.find(el => el.uid === this.authService.getUser().uid);
    if (existingSlot) {
      const update: Partial<IPickupGameSlot> = {
        slots: existingSlot.slots + totalSlots
      }
      return this.apiPostService.updatePickupSlot(existingSlot.id, update);
    } else {
      const data: IPickupGameSlot = {
        slots: totalSlots,
        uid: this.authService.getUser().uid,
        timestamp: new Date().getTime(),
        orderID,
        seasonID: this.seasonID
      }
      return this.apiPostService.savePickupSlot(data);
    }
  }

  openWaitingList() {
    const user = this.authService.getUser();
    if (user) {
      this.dialog.open(WaitingListDialogComponent, {
        panelClass: 'fk-dialogs',
        data: this.season,
      });
    } else {
      this.redirectToUrl('/signup', `/pickup-game/${this.season.id}/waiting-list`);
    }
  }

  dismissDialog() {
    this.hideLoader();
  }

  showLoader() {
    this.isLoaderShown = true;
    this.cdr.detectChanges();
  }

  hideLoader() {
    this.isLoaderShown = false;
    this.cdr.detectChanges();
  }

}
