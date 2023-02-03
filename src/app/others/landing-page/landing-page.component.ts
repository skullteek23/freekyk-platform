import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { LANDING_PAGE } from '@shared/web-content/WEBSITE_CONTENT';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  readonly mainContent = LANDING_PAGE.banner;
  readonly fkPlayContent = LANDING_PAGE.freekykPlay;
  readonly fkFreestyleContent = LANDING_PAGE.freekykFreestyle;
  readonly fkAcademiesContent = LANDING_PAGE.freekykAcademies;
  readonly fkEquipmentContent = LANDING_PAGE.freekykEquipment;
  readonly whyChoose = LANDING_PAGE.whyChooseFreekyk;
  readonly communityNumbersContent = LANDING_PAGE.communityNumbers;
  // readonly sliderContent = LANDING_PAGE.communityMedia;

  responsiveSize;
  seasonsList: SeasonBasicInfo[] = [];

  constructor(
    private dialog: MatDialog,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.getLiveSeasons();
    this.onResizeSlider();
  }

  getLiveSeasons() {
    const currentTimestamp = new Date().getTime();
    this.ngFire.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).snapshotChanges()
      .pipe(
        map((resp) => {
          const seasons: SeasonBasicInfo[] = [];
          resp.forEach(doc => {
            const data = doc.payload.doc.data() as SeasonBasicInfo;
            const id = doc.payload.doc.id;
            if (data.status === 'PUBLISHED') {
              seasons.push({ id, ...data } as SeasonBasicInfo);
            }
          });
          return seasons.sort(ArraySorting.sortObjectByKey('lastRegDate', 'desc'));
        }))
      .subscribe({
        next: (response: SeasonBasicInfo[]) => {
          this.seasonsList = response;
        },
        error: () => {
          this.seasonsList = [];
        }
      });
  }

  onResizeSlider(): void {
    if (this.isMobile) {
      this.responsiveSize = { width: '20%', height: 300, space: 4 };
    } else {
      this.responsiveSize = { width: '40%', height: 150, space: 4 };
    }
  }

  openLiveSeason(data: SeasonBasicInfo) {
    this.dialog.open(LiveSeasonComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  get isMobile(): boolean {
    return window.innerWidth > 599;
  }
}
