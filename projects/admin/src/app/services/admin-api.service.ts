import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ISeason } from '@shared/interfaces/season.model';
import { parseSeasonDataV2, parseSeasonNamesData } from '@shared/utils/pipe-functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getUniqueDocID(): string {
    return this.angularFirestore.createId();
  }

  getSeasons(limit?: number): Observable<ISeason[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(parseSeasonDataV2)
  }

  getSeasonNamesOnly(): Observable<string[]> {
    return this.angularFirestore.collection('seasons').get()
      .pipe(
        parseSeasonDataV2,
        parseSeasonNamesData
      );
  }
}
