import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFeatureSectionData } from '@shared/components/feature-section/feature-section.component';
import { IPointersComponentData } from '@shared/components/why-choose-section/why-choose-section.component';
import { MatchFixture } from '@shared/interfaces/match.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ApiGetService } from '@shared/services/api.service';
import { LANDING_PAGE } from '@shared/web-content/WEBSITE_CONTENT';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  // readonly mainContent = LANDING_PAGE.banner;
  // readonly fkPlayContent = LANDING_PAGE.freekykPlay;
  // readonly fkFreestyleContent = LANDING_PAGE.freekykFreestyle;
  // readonly fkAcademiesContent = LANDING_PAGE.freekykAcademies;
  // readonly fkEquipmentContent = LANDING_PAGE.freekykEquipment;
  // readonly sliderContent = LANDING_PAGE.communityMedia;
  readonly communityNumbersContent = LANDING_PAGE.communityNumbers;
  readonly whyChoose: IPointersComponentData = LANDING_PAGE.howItWorks;
  readonly playData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykPlay.subHeading,
    subtitle: LANDING_PAGE.freekykPlay.subtitle,
    imgUrl: 'assets/svgs/Banner/play_banner.svg',
    content: LANDING_PAGE.freekykPlay.desc,
    cta: {
      label: 'Open Freekyk Play',
      route: '/play/home'
    }
  }
  readonly freestyleData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykFreestyle.subHeading,
    subtitle: LANDING_PAGE.freekykFreestyle.subtitle,
    imgUrl: 'assets/svgs/Banner/freestyle_banner.svg',
    content: LANDING_PAGE.freekykFreestyle.desc,
    cta: {
      label: 'Open Freekyk Freestyle',
      route: '/freestyle/home'
    }

  }
  readonly equipmentData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykEquipment.subHeading,
    subtitle: LANDING_PAGE.freekykEquipment.subtitle,
    imgUrl: 'assets/svgs/Banner/equipment_banner.svg',
    content: LANDING_PAGE.freekykEquipment.desc,
    cta: {
      label: 'Open Freekyk Equipment',
      route: '/equipment'
    }
  }
  readonly academiesData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykAcademies.subHeading,
    subtitle: LANDING_PAGE.freekykAcademies.subtitle,
    imgUrl: 'assets/svgs/Banner/academy_banner.svg',
    content: LANDING_PAGE.freekykAcademies.desc,
    cta: {
      label: 'Open Freekyk Academies',
      route: '/academies'
    }
  }

  seasonsList: SeasonBasicInfo[] = [];
  fixtures: MatchFixture[] = [];
  matchesLabel: string = null;

  constructor(
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getLiveFixtures();
  }

  resetLabel() {
    this.matchesLabel = 'Our Matches';
  }

  getLiveFixtures() {
    this.apiService.getLiveFixtures(5)
      .subscribe({
        next: (response) => {
          if (response?.length) {
            this.fixtures = response;
            this.matchesLabel = `Live Matches`;
          } else {
            this.getFixtures();
          }
        },
        error: () => {
          this.fixtures = [];
          this.resetLabel();
        }
      })
  }

  getFixtures() {
    this.apiService.getFixtures(5)
      .subscribe({
        next: (response) => {
          if (response?.length) {
            this.fixtures = response;
            this.matchesLabel = `Upcoming Fixtures`;
          } else {
            this.getResults();
          }
        },
        error: () => {
          this.fixtures = [];
          this.resetLabel();
        }
      })
  }

  getResults() {
    this.apiService.getResults(5)
      .subscribe({
        next: (response) => {
          if (response?.length) {
            this.fixtures = response;
            this.matchesLabel = `Match Results`;
          }
        },
        error: () => {
          this.fixtures = [];
          this.resetLabel();
        }
      })
  }

  onNavigate(data: any): void {
    if (data?.cta?.route) {
      this.router.navigate([data.cta.route]);
    }
  }

  onNavigateSeasons(data: any): void {
    this.router.navigate(['/play', 'seasons']);
  }

  showAllFixtures() {
    this.router.navigate(['/play', 'fixtures'])
  }
}
