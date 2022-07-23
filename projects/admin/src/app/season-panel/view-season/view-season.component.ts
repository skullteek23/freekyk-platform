import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { forkJoin, merge, Observable } from 'rxjs';
import { map, mergeAll, mergeMap, tap } from 'rxjs/operators';
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
    'actions',
    // 'fixtures',
    // 'gallery',
    // 'stats',
    // 'terminate',
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
        )
      )
      .subscribe((resp) => (this.seasons = resp));
  }
  onEditSeason(season: SeasonBasicInfo): void {
    if (!season.isSeasonStarted) {
      this.router.navigate(['/seasons', 'edit', season.id]);
    }
  }
  onTerminateSeasons(season: SeasonBasicInfo): void {
    if (!season.isSeasonStarted) {
      forkJoin([this.ngFire.collection('seasons').doc(season.id).delete(), this.ngFire.collection(`seasons/${season.id}/additionalInfo`).doc('moreInfo').delete()]).subscribe(resp => {
        if (resp) {
          this.snackService.displayCustomMsg('Season deleted successfully!');
        }
      })
    }
  }

  onSetFixtures(season: SeasonBasicInfo) {
    if (!season.isSeasonStarted) {
      this.router.navigate(['/seasons', 'fixtures', season.id]);
    }
  }
  onAddGallery(sid: string) {
    this.router.navigate(['/seasons', 'gallery', sid]);
  }
  onUpdateMatchReport(season: SeasonBasicInfo) {
    if (season.isSeasonStarted) {
      this.router.navigate(['/seasons', 'update-match', season.id]);
    }
  }
}
