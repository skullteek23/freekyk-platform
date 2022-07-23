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
    // 'fixt',
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
  onEditSeason(sid: string): void {
    this.router.navigate(['/seasons', 'edit', sid]);
  }
  onTerminateSeasons(sid: string): void {
    forkJoin([this.ngFire.collection('seasons').doc(sid).delete(), this.ngFire.collection(`seasons/${sid}/additionalInfo`).doc('moreInfo').delete()]).subscribe(resp => {
      if (resp) {
        this.snackService.displayCustomMsg('Season deleted successfully!');
      }
    })
  }
}
