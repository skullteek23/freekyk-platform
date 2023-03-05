import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { ISeasonPartner } from '@shared/interfaces/season.model';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { LeagueTableModel, ListOption } from '@shared/interfaces/others.model';
import { MatDialog } from '@angular/material/dialog';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import * as _ from 'lodash';
import { ApiService } from '@shared/services/api.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';
import { Subscription } from 'rxjs';
import { Formatters } from '@shared/interfaces/team.model';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
@Component({
  selector: 'app-season-profile',
  templateUrl: './season-profile.component.html',
  styleUrls: ['./season-profile.component.scss'],
})
export class SeasonProfileComponent implements OnInit, OnDestroy {

  isLoaderShown = false;
  season: Partial<SeasonAllInfo> = null;
  seasonID: string = null;
  matches: MatchFixture[] = [];
  knockoutData: IKnockoutData = null;
  leagueRowsData: LeagueTableModel[] = [];
  partners: ISeasonPartner[] = [];
  groundsList: ListOption[] = [];
  subscriptions = new Subscription();
  formatter: any

  constructor(
    private route: ActivatedRoute,
    private enlargeService: EnlargeService,
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiService
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSeasonInfo(): void {
    if (this.seasonID) {
      this.isLoaderShown = true;
      this.apiService.getAllSeasonInfo(this.seasonID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.season = response;
              this.seasonID = response.id;
              this.getSeasonMatches();
              this.getSeasonStandings();
              this.getSeasonPartners();
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
    if (this.season.cont_tour.includes('FKC')) {
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
    if (this.season.cont_tour.includes('FPL')) {
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

  openGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  participate(): void {
    if (this.season?.id) {
      this.router.navigate(['/dashboard/participate', this.season.id]);
    }
  }

  enlargePhoto(): void {
    if (this.season?.imgpath) {
      this.enlargeService.onOpenPhoto(this.season.imgpath);
    }
  }

  get getTournamentInfo(): ListOption[] {
    return [
      { viewValue: 'Allowed Age group: ', value: this.season.ageCategory },
      { viewValue: 'Date: ', value: '' },
      { viewValue: 'Entry Fees(per team): ', value: '' },
      { viewValue: 'Ground(s): ', value: '' },
      { viewValue: '', value: '' }
    ]
  }
}
