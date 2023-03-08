import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { MatchFixture, MatchStatus, ParseMatchProperties } from '@shared/interfaces/match.model';
import { LeagueTableModel } from '@shared/interfaces/others.model';
import { ISeasonPartner, SeasonBasicInfo } from '@shared/interfaces/season.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { manipulateFixtureData, manipulateGroundData, manipulateKnockoutData, manipulateLeagueData, manipulatePlayerData, manipulatePlayersData, manipulateSeasonBulkData, manipulateSeasonData, manipulateSeasonOrdersData, manipulateSeasonPartnerData, manipulateTeamBulkData, manipulateTeamData, SeasonAllInfo, TeamAllInfo } from '@shared/utils/pipe-functions';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
      .pipe(manipulatePlayersData);
  }

  getPlayer(docID: string): Observable<PlayerBasicInfo> {
    if (docID) {
      return this.angularFirestore.collection('players').doc(docID).get()
        .pipe(manipulatePlayerData);
    }
  }

  getSeasons(limit?: number): Observable<SeasonBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '!=', 'REMOVED').limit(limit);
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonData)
  }

  getPublishedSeasons(limit?: number): Observable<SeasonBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonData)
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
      ]).pipe(manipulateSeasonOrdersData)
    } else {
      return this.getPublishedSeasons(limit);
    }
  }

  getLiveSeasons(): Observable<SeasonBasicInfo[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();
    return this.angularFirestore.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).get()
      .pipe(manipulateSeasonData)
  }

  getAllMatches(limit?: number): Observable<MatchFixture[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
  }

  getTeams(limit?: number): Observable<TeamBasicInfo[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('teams', query).get()
      .pipe(manipulateTeamData)
  }

  getAllTeamInfo(docID: string): Observable<Partial<TeamAllInfo>> {
    if (docID) {
      return forkJoin([
        this.angularFirestore.collection('teams').doc(docID).get(),
        this.angularFirestore.collection(`teams/${docID}/additionalInfo`).doc('moreInfo').get(),
        this.angularFirestore.collection(`teams/${docID}/additionalInfo`).doc('statistics').get(),
        this.angularFirestore.collection(`teams/${docID}/additionalInfo`).doc('media').get(),
        this.angularFirestore.collection(`teams/${docID}/additionalInfo`).doc('members').get(),
      ]).pipe(manipulateTeamBulkData)
    }
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
      .pipe(manipulateFixtureData)
  }

  getLiveFixtures(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    const currentTime = new Date().getTime();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '>', comparator).where('date', '<', currentTime).limit(limit);
    } else {
      query = (query) => query.where('date', '>', comparator).where('date', '<', currentTime)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
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
      .pipe(manipulateFixtureData)
  }

  getGrounds(): Observable<GroundBasicInfo[]> {
    return this.angularFirestore.collection('grounds').get()
      .pipe(manipulateGroundData)
  }

  getAllSeasonInfo(docID: string): Observable<Partial<SeasonAllInfo>> {
    return forkJoin([
      this.angularFirestore.collection('seasons').doc(docID).get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('moreInfo').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('statistics').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('media').get(),
    ]).pipe(manipulateSeasonBulkData)
  }

  getSeasonMatches(season: string): Observable<MatchFixture[]> {
    if (season) {
      const query = (query) => query.where('season', '==', season)
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(manipulateFixtureData)
    }
  }

  getKnockoutMatches(season: string): Observable<IKnockoutData> {
    if (season) {
      const query = (query) => query.where('season', '==', season).where('type', '==', 'FKC')
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(manipulateKnockoutData)
    }
  }

  getLeagueTable(season: Partial<SeasonBasicInfo>): Observable<LeagueTableModel[]> {
    if (season?.cont_tour?.includes('FPL')) {
      return this.angularFirestore.collection('leagues').doc(season.id).get()
        .pipe(manipulateLeagueData)
    }
    return of(null);
  }

  getSeasonPartners(seasonID: string): Observable<ISeasonPartner[]> {
    if (seasonID) {
      const query = (query) => query.where('seasonID', '==', seasonID)
      return this.angularFirestore.collection('partners', query).get()
        .pipe(manipulateSeasonPartnerData)
    }
  }
}
