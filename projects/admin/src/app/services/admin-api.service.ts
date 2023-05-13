import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ISeason } from '@shared/interfaces/season.model';
import { ApiGetService } from '@shared/services/api.service';
import { parseSeasonDataV2, parseSeasonNamesData } from '@shared/utils/pipe-functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService extends ApiGetService {

  constructor(
    _angularFirestore: AngularFirestore
  ) {
    super(_angularFirestore)
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
