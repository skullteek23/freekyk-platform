import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { IFeatureSectionData } from '@shared/components/feature-section/feature-section.component';
import { IPointersComponentData } from '@shared/components/why-choose-section/why-choose-section.component';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ApiService } from '@shared/services/api.service';
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
  readonly communityNumbersContent = LANDING_PAGE.communityNumbers;
  // readonly sliderContent = LANDING_PAGE.communityMedia;
  readonly whyChoose: IPointersComponentData = LANDING_PAGE.howItWorks;

  readonly playData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykPlay.subHeading,
    subtitle: LANDING_PAGE.freekykPlay.subtitle,
    imgUrl: 'assets/svgs/Banner/play_banner.svg',
    content: LANDING_PAGE.freekykPlay.desc,
    cta: {
      label: 'Learn More',
      route: '/play/home'
    }
  }
  readonly freestyleData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykFreestyle.subHeading,
    subtitle: LANDING_PAGE.freekykFreestyle.subtitle,
    imgUrl: 'assets/svgs/Banner/freestyle_banner.svg',
    content: LANDING_PAGE.freekykFreestyle.desc,
    cta: {
      label: 'Learn More',
      route: '/freestyle/home'
    }

  }
  readonly equipmentData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykEquipment.subHeading,
    subtitle: LANDING_PAGE.freekykEquipment.subtitle,
    imgUrl: 'assets/svgs/Banner/equipment_banner.svg',
    content: LANDING_PAGE.freekykEquipment.desc,
    cta: {
      label: 'Learn More',
      route: '/equipment'
    }
  }
  readonly academiesData: IFeatureSectionData = {
    title: LANDING_PAGE.freekykAcademies.subHeading,
    subtitle: LANDING_PAGE.freekykAcademies.subtitle,
    imgUrl: 'assets/svgs/Banner/academy_banner.svg',
    content: LANDING_PAGE.freekykAcademies.desc,
    cta: {
      label: 'Learn More',
      route: '/academies'
    }
  }

  responsiveSize;
  seasonsList: SeasonBasicInfo[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
  }
}
