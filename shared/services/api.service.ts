import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { MatchFixture } from '@shared/interfaces/match.model';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { manipulateFixtureData, manipulateGroundData, manipulatePlayerData, manipulateSeasonData, manipulateTeamData } from '@shared/utils/pipe-functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getPlayers(): Observable<PlayerBasicInfo[]> {
    return this.angularFirestore.collection('players').get()
      .pipe(manipulatePlayerData.bind(this));
  }

  getSeasons(): Observable<SeasonBasicInfo[]> {
    return this.angularFirestore.collection('seasons').get()
      .pipe(manipulateSeasonData.bind(this))
  }

  getTeams(): Observable<TeamBasicInfo[]> {
    return this.angularFirestore.collection('teams', (ref) => ref.orderBy('tname')).get()
      .pipe(manipulateTeamData.bind(this))
  }

  getMatches(isResults = false): Observable<QuerySnapshot<unknown>> {
    return this.angularFirestore.collection('allMatches', (query) => query.where('concluded', '==', isResults)).get()
  }

  getGrounds(): Observable<GroundBasicInfo[]> {
    return this.angularFirestore.collection('grounds').get()
      .pipe(manipulateGroundData.bind(this))
  }
}
