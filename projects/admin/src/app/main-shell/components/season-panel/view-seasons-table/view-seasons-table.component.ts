import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeasonDraft, statusType } from '@shared/interfaces/season.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { SeasonAdminService } from '../season-admin.service';

@Component({
  selector: 'app-view-seasons-table',
  templateUrl: './view-seasons-table.component.html',
  styleUrls: ['./view-seasons-table.component.scss']
})
export class ViewSeasonsTableComponent implements OnInit, OnDestroy {

  cols = ['sno', 'season', 'startDate', 'status',];
  seasons: any[] = [];
  subscription = new Subscription();

  constructor(
    private ngFire: AngularFirestore,
    private router: Router,
    private seasonAdminService: SeasonAdminService
  ) { }

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
        map(resp => resp.sort(ArraySorting.sortObjectByKey('lastUpdated', 'desc')))
      )
      .subscribe((resp) => (this.seasons = resp)));
  }

  createSeason() {
    this.router.navigate(['/seasons/create',]);
  }

  isSeasonLive(status: statusType): boolean {
    return this.seasonAdminService.isSeasonLive(status);
  }

  isSeasonFinished(status: statusType): boolean {
    return this.seasonAdminService.isSeasonFinished(status);
  }

  getStatusClass(status: statusType): any {
    return this.seasonAdminService.getStatusClass(status);
  }
}
