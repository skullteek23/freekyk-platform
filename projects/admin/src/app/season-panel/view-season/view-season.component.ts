import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-view-season',
  templateUrl: './view-season.component.html',
  styleUrls: ['./view-season.component.css'],
})
export class ViewSeasonComponent implements OnInit {
  seasons: any[] = [];
  cols = [
    'sno',
    'season',
    'startDate',
    'actions',
  ];
  constructor(private ngFire: AngularFirestore, private router: Router, private snackService: SnackbarService) { }

  ngOnInit(): void {
    this.ngFire
      .collection('seasons')
      .snapshotChanges()
      .pipe(
        map((docs) =>
          docs.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as SeasonBasicInfo),
            } as SeasonBasicInfo)
          )
        ),
        map(data => data.map(el =>
        ({
          ...el,
          start_date: new Date(el.start_date['seconds'] * 1000),
          isSeasonLive: (new Date(el.start_date['seconds'] * 1000).getTime() < new Date().getTime()) && !el['isSeasonEnded']
        })
        ))
      )
      .subscribe((resp) => (this.seasons = resp));
  }
  onTerminateSeasons(season: SeasonBasicInfo): void {
    if (this.isSeasonStarted(season) || season.isFixturesCreated) {
      return;
    }
    forkJoin([this.ngFire.collection('seasons').doc(season.id).delete(), this.ngFire.collection(`seasons/${season.id}/additionalInfo`).doc('moreInfo').delete()]).subscribe(resp => {
      if (resp) {
        this.snackService.displayCustomMsg('Season deleted successfully!');
      }
    })
  }
  onAddGallery(season: SeasonBasicInfo) {
    return;
    this.router.navigate(['/seasons', 'gallery', season.id], { queryParams: { 'name': season.name } });
  }
  onUpdateMatchReport(season: SeasonBasicInfo) {
    if (this.isSeasonStarted(season) && season.isFixturesCreated && !season.isSeasonEnded) {
      this.router.navigate(['/seasons', 'update-match', season.id], { queryParams: { 'name': season.name } });
    }
  }

  isSeasonStarted(data): boolean {
    const currentTimestamp = new Date().getTime();
    return data && (data.start_date.getTime() < currentTimestamp);
  }
}
