import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPointersComponentData } from '@shared/components/why-choose-section/why-choose-section.component';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { ApiService } from '@shared/services/api.service';
import { PaymentService } from '@shared/services/payment.service';
import { LANDING_PAGE, PLAY_PAGE } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-pl-home',
  templateUrl: './pl-home.component.html',
  styleUrls: ['./pl-home.component.scss'],
})
export class PlHomeComponent implements OnInit {
  // readonly findTeamContent = PLAY_PAGE.findTeam;
  // readonly seasonsContent = PLAY_PAGE.season;
  // readonly fkcContent = PLAY_PAGE.fkc;
  // readonly fcpContent = PLAY_PAGE.fcp;
  // readonly fplContent = PLAY_PAGE.fpl;
  // readonly customizeContent = PLAY_PAGE.customize;
  // readonly whyChooseContent = PLAY_PAGE.whyChoosePlay;
  readonly communityNumbers = LANDING_PAGE.communityNumbers;
  readonly whyChoose: IPointersComponentData = LANDING_PAGE.howItWorks;

  upcomingSeason: SeasonBasicInfo = null;
  teams: TeamBasicInfo[] = [];
  players: PlayerBasicInfo[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getUpcomingSeason();
    this.getTeams();
    this.getPlayers();
  }

  getUpcomingSeason() {
    this.apiService.getPublishedSeasonWithPaymentInfo(1)
      .subscribe({
        next: (response) => {
          if (response?.length) {
            this.upcomingSeason = response[0];
          }
        },
        error: (error) => {
          this.upcomingSeason = null;
        }
      });
  }

  getTeams() {
    this.apiService.getTeams(4)
      .subscribe({
        next: (response) => {
          if (response && response.length) {
            this.teams = response;
          }
        },
        error: (error) => {
          this.teams = [];
        },
      })
  }

  getPlayers() {
    this.apiService.getPlayers(20)
      .subscribe({
        next: (response) => {
          if (response && response.length) {
            this.players = response;
          }
        },
        error: (error) => {
          this.players = [];
        },
      })
  }

  showAllSeason() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.router.navigate(['/dashboard/participate']);
    } else {
      this.router.navigate(['/play/seasons']);
    }
  }

  showAllTeams() {
    this.router.navigate(['/play/teams']);
  }

  showAllPlayers() {
    this.router.navigate(['/play/players']);
  }

  participate() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.router.navigate(['/dashboard/participate', this.upcomingSeason.id]);
    } else {
      this.router.navigate(['/play/seasons']);
    }
  }

  openOffers() {
    console.log('openOffers');
  }
}
