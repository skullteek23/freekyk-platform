import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeasonBasicInfo, SeasonDraft, statusType } from 'src/app/shared/interfaces/season.model';
import { GenerateFixturesService } from '../generate-fixtures.service';

@Component({
  selector: 'app-view-seasons-table',
  templateUrl: './view-seasons-table.component.html',
  styleUrls: ['./view-seasons-table.component.css']
})
export class ViewSeasonsTableComponent implements OnInit, OnDestroy {

  cols = ['sno', 'season', 'startDate', 'status',];
  seasons: any[] = [];
  subscription = new Subscription();

  constructor(private ngFire: AngularFirestore, private router: Router, private generateFixtureService: GenerateFixturesService) { }

  ngOnInit(): void {
    this.getSeasons();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getSeasons(): void {
    this.subscription.add(this.ngFire.collection('seasonDrafts').snapshotChanges()
      .pipe(
        map((docs) => docs.map((doc) => ({ id: doc.payload.doc.id, ...(doc.payload.doc.data() as SeasonDraft), } as SeasonDraft))),
        map(data => data.map(el => ({
          ...el,
          start_date: new Date(el.basicInfo?.startDate['seconds'] * 1000)
        })))
      )
      .subscribe((resp) => (this.seasons = resp)));
  }

  createSeason() {
    this.router.navigate(['/seasons/create',]);
  }

  isSeasonLive(status: statusType): boolean {
    return this.generateFixtureService.isSeasonLive(status);
  }

  isSeasonFinished(status: statusType): boolean {
    return this.generateFixtureService.isSeasonFinished(status);
  }

  getStatusClass(status: statusType): any {
    return this.generateFixtureService.getStatusClass(status);
  }
}
