import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { merge, Observable } from 'rxjs';
import { map, mergeAll, mergeMap, tap } from 'rxjs/operators';
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
    'confTeams',
    'fixt',
    'gallery',
    'stats',
    'terminate',
  ];
  constructor(private ngFire: AngularFirestore) {}

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
                participants: null,
                ...(doc.payload.doc.data() as SeasonBasicInfo),
              } as SeasonBasicInfo)
          )
        )
      )
      .subscribe((resp) => (this.seasons = resp));
  }
  onTerminateSeason(seasonid: string) {
    // this.ngFire.collection('seasons').doc('')
  }
  onViewParticipants(seasonid: string): void {
    console.log(seasonid);
    this.ngFire
      .collection(`seasons/${seasonid}/participants`)
      .valueChanges()
      .pipe(map((resp) => (resp ? resp.length : 0)))
      .subscribe((response) => {
        this.seasons[
          this.seasons.findIndex((val: SeasonBasicInfo) => val.id === seasonid)
        ].participants = response;
      });
  }
}
