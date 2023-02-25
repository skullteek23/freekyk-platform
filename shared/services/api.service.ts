import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { MatchFixture, MatchStatus, ParseMatchProperties } from '@shared/interfaces/match.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { manipulateFixtureData, manipulateGroundData, manipulatePlayerData, manipulateSeasonData, manipulateSeasonOrdersData, manipulateTeamData } from '@shared/utils/pipe-functions';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getPlayers(limit?: number): Observable<PlayerBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('players', query).get()
      .pipe(manipulatePlayerData.bind(this));
  }

  getSeasons(limit?: number): Observable<SeasonBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '!=', 'REMOVED').limit(limit);
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonData.bind(this))
  }

  getPublishedSeasons(limit?: number): Observable<SeasonBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonData.bind(this))
  }

  getPublishedSeasonWithPaymentInfo(limit?: number): Observable<SeasonBasicInfo[]> {
    const uid = localStorage.getItem('uid');
    if (uid) {
      let query;
      if (limit && limit > 0) {
        query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
      } else {
        query = (query) => query.where('status', '==', 'PUBLISHED')
      }
      return forkJoin([
        this.angularFirestore.collection('seasons', query).get(),
        this.angularFirestore.collection('orders', (query) => query.where('receipt', '==', uid)).get()
      ]).pipe(manipulateSeasonOrdersData.bind(this))
    } else {
      return this.getPublishedSeasons(limit);
    }
  }

  getLiveSeasons(): Observable<SeasonBasicInfo[]> {
    const currentTimestamp = new Date().getTime();
    return this.angularFirestore.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).get()
      .pipe(manipulateSeasonData.bind(this))
  }

  getTeams(limit?: number): Observable<TeamBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('teams', query).get()
      .pipe(manipulateTeamData.bind(this))
  }

  getFixtures(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '>', comparator).limit(limit);
    } else {
      query = (query) => query.where('date', '>', comparator)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData.bind(this))
  }

  getLiveFixtures(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    let query;
    const liveStatus = MatchStatus.ONG;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '>', comparator).where('status', '==', liveStatus).limit(limit);
    } else {
      query = (query) => query.where('date', '>', comparator).where('status', '==', liveStatus)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData.bind(this))
  }

  getResults(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '<=', comparator).limit(limit);
    } else {
      query = (query) => query.where('date', '<=', comparator)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData.bind(this))
  }

  getGrounds(): Observable<GroundBasicInfo[]> {
    return this.angularFirestore.collection('grounds').get()
      .pipe(manipulateGroundData.bind(this))
  }
}
