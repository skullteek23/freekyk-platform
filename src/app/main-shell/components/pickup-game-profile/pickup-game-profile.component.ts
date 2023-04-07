import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchConstants } from '@shared/constants/constants';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ListOption } from '@shared/interfaces/others.model';
import { Formatters } from '@shared/interfaces/team.model';
import { ApiGetService } from '@shared/services/api.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pickup-game-profile',
  templateUrl: './pickup-game-profile.component.html',
  styleUrls: ['./pickup-game-profile.component.scss']
})
export class PickupGameProfileComponent implements OnInit {

  readonly customDateFormat = MatchConstants.GROUND_SLOT_DATE_FORMAT;
  readonly oneHourMilliseconds = 3600000;

  subscriptions = new Subscription();
  seasonID: string = null;
  season: Partial<SeasonAllInfo> = null;
  isLoaderShown = false;
  startDate = '';
  match: MatchFixture;
  ground: ListOption;
  ageCatFormatter: any;
  slotsA = [1, 2, 3, 4, 5, 6, 7];
  slotsB = [1, 2, 3, 4, 5, 6, 7];
  reportingTime: number = null;
  payableFees = 0;
  addedSlotsA: number[] = [];
  addedSlotsB: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiGetService,
    private router: Router,
    private dialog: MatDialog,
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
              this.createStartDate();
              this.getSeasonMatches();
              this.reportingTime = this.season.startDate - (MatchConstants.ONE_HOUR_IN_MILLIS / 4);
              // this.createSeasonStats();
              // this.createSeasonMedia();
              // this.getSeasonStandings();
              // this.getSeasonPartners();
              // if (window.location.href.endsWith('/pay')) {
              //   this.participate();
              // }
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

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
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

  addSlotA(slot: number) {
    if (this.addedSlotsA.findIndex(sl => sl === slot) > -1) {
      this.addedSlotsA.splice(this.addedSlotsA.findIndex(sl => sl === slot), 1)
      this.payableFees -= this.season.fees;
    } else {
      this.addedSlotsA.push(slot)
      this.payableFees += this.season.fees;
    }
  }

  addSlotB(slot: number) {
    if (this.addedSlotsB.findIndex(sl => sl === slot) > -1) {
      this.addedSlotsB.splice(this.addedSlotsB.findIndex(sl => sl === slot), 1)
      this.payableFees -= this.season.fees;
    } else {
      this.addedSlotsB.push(slot);
      this.payableFees += this.season.fees;
    }
  }

  getStarted() {
    this.dialog.open(ConfirmationBoxComponent).afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            alert('payment init');
          }
        }
      })
  }

}
