import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DatePipe, Location } from "@angular/common";
import { EnlargeService } from 'src/app/services/enlarge.service';
import { ISeasonPartner } from '@shared/interfaces/season.model';
import { MatchFixture } from '@shared/interfaces/match.model';
import { LeagueTableModel, ListOption } from '@shared/interfaces/others.model';
import { MatDialog } from '@angular/material/dialog';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import * as _ from 'lodash';
import { ApiGetService } from '@shared/services/api.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { Formatters } from '@shared/interfaces/team.model';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
import { IStatisticsCard } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';
import { PaymentService } from '@shared/services/payment.service';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { SnackbarService } from '@shared/services/snackbar.service';
import { ICheckoutOptions, IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { AuthService } from '@app/services/auth.service';
@Component({
  selector: 'app-season-profile',
  templateUrl: './season-profile.component.html',
  styleUrls: ['./season-profile.component.scss'],
  providers: [DatePipe]
})
export class SeasonProfileComponent implements OnInit, OnDestroy {

  isLoaderShown = false;
  season: Partial<SeasonAllInfo> = null;
  seasonStats: IStatisticsCard[] = [];
  seasonMedia: any[] = [];
  seasonID: string = null;
  matches: MatchFixture[] = [];
  knockoutData: IKnockoutData = null;
  leagueRowsData: LeagueTableModel[] = [];
  partners: ISeasonPartner[] = [];
  groundsList: ListOption[] = [];
  subscriptions = new Subscription();
  formatter: any;

  constructor(
    private route: ActivatedRoute,
    private enlargeService: EnlargeService,
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiGetService,
    private paymentService: PaymentService,
    private snackBarService: SnackbarService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.formatter = Formatters;
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
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSeasonInfo(): void {
    if (this.seasonID) {
      this.isLoaderShown = true;
      this.apiService.getSeasonAllInfo(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.season = response;
              this.seasonID = response.id;
              this.createSeasonStats();
              this.createSeasonMedia();
              this.getSeasonMatches();
              this.getSeasonStandings();
              this.getSeasonPartners();
              if (window.location.href.endsWith('/pay')) {
                this.participate();
              }
            } else {
              this.router.navigate(['error'])
            }
            this.isLoaderShown = false;
            window.scrollTo(0, 0);
          },
          error: (error) => {
            this.season = null;
            this.isLoaderShown = false;
            window.scrollTo(0, 0);
            this.router.navigate(['/error']);
          }
        })
    }
  }

  getSeasonMatches() {
    if (this.season?.name) {
      this.apiService.getSeasonMatches(this.season.name)
        .subscribe({
          next: (response) => {
            if (response) {
              this.matches = response;
              this.groundsList = _.uniqBy(response, 'groundID').map(el => ({ viewValue: el.ground, value: el.groundID } as ListOption));
            }
          },
          error: (error) => {
            this.groundsList = [];
            this.matches = [];
          }
        })
    }
  }

  getSeasonStandings() {
    if (this.season.type === 'FKC') {
      this.apiService.getKnockoutMatches(this.season.name)
        .subscribe({
          next: (response) => {
            if (response) {
              this.knockoutData = response;
            }
          },
          error: (error) => {
            this.knockoutData = null;
          }
        })
    }
    if (this.season.type === 'FPL') {
      this.apiService.getLeagueTable(this.season)
        .subscribe({
          next: (response) => {
            if (response) {
              this.leagueRowsData = response;
            }
          },
          error: (error) => {
            this.leagueRowsData = [];
          }
        })
    }
  }

  getSeasonPartners() {
    if (this.season?.id) {
      this.apiService.getSeasonPartners(this.season.id)
        .subscribe({
          next: (response) => {
            if (response) {
              this.partners = response;
            }
          },
          error: (error) => {
            this.partners = [];
          }
        })
    }
  }

  createSeasonStats() {
    this.seasonStats = [];
    this.seasonStats.push({ icon: 'sports_soccer', label: 'Goals', value: this.season?.g || 0 });
    this.seasonStats.push({ icon: 'style', label: 'Red Cards', value: this.season?.rcards || 0, iconClass: 'red' });
    this.seasonStats.push({ icon: 'style', label: 'Yellow Cards', value: this.season?.ycards || 0, iconClass: 'yellow' });
  }

  createSeasonMedia() {
    this.seasonMedia = [];
    if (this.season?.photos?.length) {
      this.season.photos.forEach(element => {
        this.seasonMedia.push({ image: element, thumbImage: element })
      });
    }
  }

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  getStarted(): void {
    this.showLoader();
    this.redirectToUrl('/signup');
  }

  participate(): void {
    this.authService.isLoggedIn().subscribe({
      next: async (user) => {
        if (user) {
          this.showLoader();
          if (!this.seasonID) {
            this.seasonID = this.route.snapshot.params['seasonid'];
          }
          const order = await this.paymentService.getOrder(this.seasonID, user.uid);
          if (order) {
            if (order.amount_due > 0) {
              const options: Partial<ICheckoutOptions> = {
                ...UNIVERSAL_OPTIONS,
                description: 'All Players',
                order_id: order.id,
                amount: order.amount_due * 100,
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
              this.hideLoader();
              this.router.navigate(['/my-matches']);
            }
          }
          this.hideLoader();
        }
      }
    })
  }

  redirectToUrl(path: string): void {
    const encodedString = encodeURIComponent(`/game/${this.season.id}/pay`);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  handlePaymentSuccess(response) {
    this.paymentService.verifyPayment(response)
      .subscribe({
        next: () => {
          const allPromises = [];
          const options: Partial<RazorPayOrder> = {
            notes: {
              itemID: this.seasonID,
              itemName: 'Season Team Entry',
              seasonID: this.seasonID,
              seasonName: this.season.name,
              itemQty: 1,
              itemCancelledQty: 0,
              itemType: IItemType.leagueOrKnockout,
              logs: [
                `Purchased Season Team Entry on ${this.datePipe.transform(new Date(), 'short')}`
              ]
            }
          }
          allPromises.push(this.paymentService.saveOrder(options, response).toPromise());
          // const tid = sessionStorage.getItem('tid');
          // allPromises.push(this.participate(season, tid).toPromise());

          Promise.all(allPromises)
            .then(() => {
              this.snackBarService.displayCustomMsg('Your Participation is confirmed!');
              this.hideLoader();
            })
            .catch((error) => {
              this.snackBarService.displayError(error?.message);
              this.hideLoader();
            })
        },
        error: (error) => {
          this.hideLoader();
          this.snackBarService.displayError(error?.message);
        }
      });
  }

  dismissDialog() {
    console.log('dismissed')
    this.hideLoader();
    this.cdr.detectChanges();
    this.location.go('/game/' + this.seasonID);
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  enlargePhoto(): void {
    if (this.season?.more?.imgpath) {
      this.enlargeService.onOpenPhoto(this.season?.more?.imgpath);
    }
  }

  get getTournamentInfo(): ListOption[] {
    return [
      { viewValue: 'Allowed Age group: ', value: this.season.ageCategory },
      { viewValue: 'Date: ', value: '' },
      { viewValue: 'Entry Fees(per team): ', value: '' },
      { viewValue: 'Ground(s): ', value: '' },
    ]
  }
}
