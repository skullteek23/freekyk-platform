import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-view-season',
  templateUrl: './view-season.component.html',
  styleUrls: ['./view-season.component.css'],
})
export class ViewSeasonComponent implements OnInit {
  seasons$: Observable<SeasonBasicInfo[]>;
  cols = [
    'sno',
    'season',
    'confTeams',
    'tmatches',
    'fixt',
    'gallery',
    'stats',
    'terminate',
  ];
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {
    this.seasons$ = this.ngFire
      .collection('seasons')
      .snapshotChanges()
      .pipe(
        map((docs) =>
          docs.map(
            (doc) =>
              <SeasonBasicInfo>{
                id: doc.payload.doc.id,
                ...(<SeasonBasicInfo>doc.payload.doc.data()),
              }
          )
        )
      );
  }
  onSelectFixtures() {}
  onSelectGallery() {}
  onSelectStats() {}
  onTerminateSeason() {}
}
